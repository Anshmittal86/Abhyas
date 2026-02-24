import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { asyncHandlerWithContext } from '@/utils/async-handler';
import { logEvent } from '@/utils/log-event';
import { requireRole } from '@/utils/auth-guard';
import { FinalizeAttemptResult } from '@/types';

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
					questions: {
						include: {
							options: true
						}
					}
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
	const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));
	const answerUpdates = [];

	for (const question of questions) {
		const selectedOptionId = answerMap.get(question.id);
		if (!selectedOptionId) continue;

		// Check if the selected option is marked as correct
		const isCorrect = question.options.some(
			(opt) => opt.id === selectedOptionId && opt.isCorrect === true
		);
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
	const maxQuestions = questions.length;
	const score = maxQuestions > 0 ? Math.round((correctCount / maxQuestions) * 100) : 0;

	// 💾 Persist all updates automatically
	await prisma.$transaction([
		...answerUpdates,
		prisma.testAttempt.update({
			where: { id: attempt.id },
			data: {
				score,
				submittedAt: new Date(),
				status: 'COMPLETED'
			}
		})
	]);

	return {
		attemptId: attempt.id,
		testId: attempt.testId,
		score,
		maxQuestions,
		correctAnswers: correctCount
	};
}

export const startTestAttempt = asyncHandlerWithContext(
	'StartTestAttempt',
	async (request, context) => {
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

		// ✅ Check test exists (with maxQuestions for progress decisions)
		const test = await prisma.test.findUnique({
			where: { id: testId },
			select: {
				id: true,
				title: true,
				durationMinutes: true,
				maxQuestions: true,
				chapter: {
					select: {
						courseId: true
					}
				}
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found');
		}

		// 🔐 Security: Check if student is actually enrolled in this test's course
		const courseId = test.chapter.courseId;
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId
				}
			}
		});

		if (!enrollment) {
			throw new ApiError(403, 'You are not enrolled in the course for this test');
		}

		// 🔁 Cleanup & Resume Logic
		const pendingAttempts = await prisma.testAttempt.findMany({
			where: {
				studentId,
				testId,
				status: 'IN_PROGRESS'
			},
			include: {
				_count: { select: { answers: true } }
			},
			orderBy: {
				startedAt: 'desc'
			}
		});

		const now = new Date();

		for (const attempt of pendingAttempts) {
			// ⏱️ Auto-submit if expired
			if (attempt.expiresAt <= now) {
				await finalizeAttempt({ studentId, attemptId: attempt.id });
				continue;
			}

			const answeredCount = attempt._count.answers;
			const maxQuestions = test.maxQuestions;

			// ✅ All questions answered but not submitted → auto-submit, then don't resume
			if (maxQuestions > 0 && answeredCount >= maxQuestions) {
				await finalizeAttempt({ studentId, attemptId: attempt.id });
				continue;
			}

			// 🧠 Valid resume found
			return NextResponse.json(
				new ApiResponse(
					200,
					{
						attemptId: attempt.id,
						testId: test.id,
						title: test.title,
						expiresAt: attempt.expiresAt,
						maxQuestions: test.maxQuestions
					},
					'Resuming existing attempt'
				),
				{ status: 200 }
			);
		}

		// 3. ✨ Create New Attempt
		const attempt = await prisma.testAttempt.create({
			data: {
				studentId,
				testId,
				status: 'IN_PROGRESS',
				expiresAt: new Date(Date.now() + test.durationMinutes * 60000) // duration in ms
			}
		});

		// Audit Log for Admin
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
					maxQuestions: test.maxQuestions
				},
				'Test attempt started'
			),
			{ status: 201 }
		);
	}
);

export const submitTestAttempt = asyncHandlerWithContext(
	'SubmitTestAttempt',
	async (request, context) => {
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
					maxQuestions: result.maxQuestions,
					correctAnswers: result.correctAnswers
				},
				'Test submitted successfully'
			),
			{ status: 200 }
		);
	}
);
