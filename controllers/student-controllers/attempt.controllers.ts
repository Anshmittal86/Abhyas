import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';
import { requireRole } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';

function getRemainingSeconds(expiresAt: Date) {
	return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
}

/**
 * Get student test attempt
 * GET /api/student/attempt/:attemptId
 */

export async function getAttempt(
	request: NextRequest,
	{ params }: { params: Promise<{ attemptId: string }> }
) {
	try {
		const indexParam = request.nextUrl.searchParams.get('index');

		// 🔐 Auth
		const { userId: studentId } = requireRole(request, ['student']);
		const { attemptId } = await params;

		// 🔍 Fetch active attempt
		const attempt = await prisma.testAttempt.findFirst({
			where: {
				id: attemptId,
				studentId,
				submittedAt: null,
				status: 'IN_PROGRESS'
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Active test attempt not found');
		}

		// ⏱️ Remaining time (client timer will handle auto-submit UX)
		const remainingSeconds = getRemainingSeconds(attempt.expiresAt);

		// 📚 Fetch all questions (stable order)
		const questions = await prisma.question.findMany({
			where: {
				testId: attempt.testId
			},
			orderBy: {
				createdAt: 'asc'
			},
			select: {
				id: true,
				questionText: true,
				optionA: true,
				optionB: true,
				optionC: true,
				optionD: true
			}
		});

		const totalQuestions = questions.length;

		// 🧮 How many answered so far
		const answeredCount = await prisma.attemptAnswer.count({
			where: {
				attemptId
			}
		});

		// Base current question index:
		// - If some questions pending → next unanswered question
		// - If all answered           → keep student on last question, let them decide when to submit
		let safeIndex =
			totalQuestions > 0 ?
				Math.min(answeredCount, totalQuestions - 1)
			:	0;

		// If client requested a specific index and it's within bounds, honor it
		if (indexParam !== null && totalQuestions > 0) {
			const requested = Number.parseInt(indexParam, 10);
			if (!Number.isNaN(requested) && requested >= 0 && requested < totalQuestions) {
				safeIndex = requested;
			}
		}

		const currentQuestion = questions[safeIndex];

		// 🔁 Check already selected option (safety)
		const savedAnswer = await prisma.attemptAnswer.findFirst({
			where: {
				attemptId,
				questionId: currentQuestion.id
			}
		});

		// 🎯 Final response
		return NextResponse.json(
			new ApiResponse(200, {
				attemptId,
				testId: attempt.testId,
				currentIndex: safeIndex,
				answeredCount,
				totalQuestions,
				remainingSeconds,
				question: {
					id: currentQuestion.id,
					text: currentQuestion.questionText,
					options: [
						{ key: 'A', text: currentQuestion.optionA },
						{ key: 'B', text: currentQuestion.optionB },
						{ key: 'C', text: currentQuestion.optionC },
						{ key: 'D', text: currentQuestion.optionD }
					]
				},
				selectedOption: savedAnswer?.selectedOption ?? null
			})
		);
	} catch (error) {
		return handleError('GetAttempt', error);
	}
}

// Backward-compatible alias (older routes referenced this name)
export const getPendingAttempt = getAttempt;
