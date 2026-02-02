import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';
import { requireRole } from '@/utils/auth-guard';

type FinalizeAttemptResult = {
	attemptId: string;
	testId: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
};

export async function finalizeAttempt(params: {
	studentId: string;
	attemptId: string;
}): Promise<FinalizeAttemptResult> {
	const { studentId, attemptId } = params;

	// 🧾 Fetch attempt with relations
	const attempt = await prisma.testAttempt.findFirst({
		where: {
			id: attemptId,
			studentId
		},
		include: {
			test: {
				include: {
					questions: true
				}
			},
			answers: true
		}
	});

	if (!attempt) {
		throw new ApiError(404, 'Test attempt not found');
	}

	// ⛔ Prevent double submission
	if (attempt.submittedAt) {
		throw new ApiError(400, 'Test already submitted');
	}

	const questions = attempt.test.questions;
	const answers = attempt.answers;

	// 🧮 Score calculation
	let correctCount = 0;
	const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]));
	const answerUpdates = [];

	for (const question of questions) {
		const selectedOption = answerMap.get(question.id);
		if (!selectedOption) continue;

		const isCorrect = selectedOption === question.correctOption;
		if (isCorrect) correctCount++;

		answerUpdates.push(
			prisma.attemptAnswer.update({
				where: {
					attemptId_questionId: {
						attemptId: attempt.id,
						questionId: question.id
					}
				},
				data: {
					isCorrect
				}
			})
		);
	}

	// 🔢 Calculate percentage score
	const totalQuestions = questions.length;
	const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

	// 💾 Persist all updates atomically
	await prisma.$transaction([
		...answerUpdates,
		prisma.testAttempt.update({
			where: { id: attempt.id },
			data: {
				score,
				submittedAt: new Date(),
				status: 'SUBMITTED'
			}
		})
	]);

	return {
		attemptId: attempt.id,
		testId: attempt.testId,
		score,
		totalQuestions,
		correctAnswers: correctCount
	};
}

export async function startTestAttempt(
	request: NextRequest,
	context: { params: Promise<{ testId: string }> }
) {
	try {
		// 🔐 Student id from middleware
		const { userId: studentId, userRole: role } = requireRole(request, ['student']);

		if (!studentId || role !== 'student') {
			throw new ApiError(401, 'Unauthorized');
		}

		const { testId } = await context.params;

		if (!testId) {
			throw new ApiError(400, 'Test id is required');
		}

		// ✅ Check student exists and active
		const student = await prisma.student.findFirst({
			where: {
				id: studentId,
				isActive: true
			}
		});

		if (!student) {
			throw new ApiError(404, 'Student not found or blocked');
		}

		// ✅ Check test exists (with totalQuestions for progress decisions)
		const test = await prisma.test.findUnique({
			where: { id: testId },
			select: {
				id: true,
				title: true,
				durationMinutes: true,
				totalQuestions: true
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found');
		}

		// 🔁 Find any in-progress attempts for this test
		const pendingAttempts = await prisma.testAttempt.findMany({
			where: {
				studentId,
				testId,
				submittedAt: null,
				status: 'IN_PROGRESS'
			},
			select: {
				id: true,
				testId: true,
				startedAt: true,
				expiresAt: true,
				_count: {
					select: {
						answers: true
					}
				}
			},
			orderBy: {
				startedAt: 'desc'
			}
		});

		const now = new Date();
		let resumeAttempt:
			| {
					id: string;
					testId: string;
					startedAt: Date;
					expiresAt: Date;
			  }
			| null = null;

		for (const attempt of pendingAttempts) {
			// ⏱️ If time is up, auto-submit old attempt (for reporting) and don't resume it
			if (attempt.expiresAt <= now) {
				await finalizeAttempt({ studentId, attemptId: attempt.id });
				continue;
			}

			const answeredCount = attempt._count.answers;
			const totalQuestions = test.totalQuestions;

			// ✅ All questions answered but not submitted → auto-submit, then don't resume
			if (totalQuestions > 0 && answeredCount >= totalQuestions) {
				await finalizeAttempt({ studentId, attemptId: attempt.id });
				continue;
			}

			// 🧠 Some questions remaining → this is a valid attempt to resume
			if (!resumeAttempt) {
				resumeAttempt = {
					id: attempt.id,
					testId: attempt.testId,
					startedAt: attempt.startedAt,
					expiresAt: attempt.expiresAt
				};
			}
		}

		// If we found a partially-answered, non-expired attempt → resume it
		if (resumeAttempt) {
			return NextResponse.json(
				new ApiResponse(
					200,
					{
						attemptId: resumeAttempt.id,
						testId: resumeAttempt.testId,
						startedAt: resumeAttempt.startedAt,
						expiresAt: resumeAttempt.expiresAt
					},
					'Resuming existing attempt'
				),
				{ status: 200 }
			);
		}

		// 🧠 Create attempt
		const attempt = await prisma.testAttempt.create({
			data: {
				studentId,
				testId,
				startedAt: new Date(),
				status: 'IN_PROGRESS',
				expiresAt: new Date(Date.now() + test.durationMinutes * 60000) // duration in ms
			}
		});

		logEvent('TestAttemptStarted', {
			studentId,
			testId,
			attemptId: attempt.id
		});

		return NextResponse.json(
			new ApiResponse(
				201,
				{
					attemptId: attempt.id,
					testId: test.id,
					startedAt: attempt.startedAt,
					durationMinutes: test.durationMinutes,
					totalQuestions: test.totalQuestions
				},
				'Test attempt started'
			),
			{ status: 201 }
		);
	} catch (error) {
		return handleError('StartTestAttempt', error);
	}
}

export async function submitTestAttempt(
	request: NextRequest,
	context: { params: Promise<{ attemptId: string }> }
) {
	try {
		// 🔐 Student authorization
		const { userId: studentId, userRole } = requireRole(request, ['student']);

		if (!studentId || userRole !== 'student') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { attemptId } = await context.params;
		const result = await finalizeAttempt({ studentId, attemptId });

		return NextResponse.json(
			new ApiResponse(
				200,
				{
					attemptId: result.attemptId,
					testId: result.testId,
					score: result.score,
					totalQuestions: result.totalQuestions,
					correctAnswers: result.correctAnswers
				},
				'Test submitted successfully'
			),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('SubmitTestAttempt', error);
	}
}
