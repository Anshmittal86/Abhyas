import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireRole } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';

import { asyncHandlerWithContext } from '@/utils/async-handler';

function getRemainingSeconds(expiresAt: Date) {
	return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
}

/**
 * Get student test attempt
 * GET /api/student/attempt/:attemptId
 */

export const getAttempt = asyncHandlerWithContext('GetAttempt', async (request, context) => {
	const indexParam = request.nextUrl.searchParams.get('index');

	// 🔐 Auth
	const { userId: studentId } = requireRole(request, ['student']);
	const { attemptId } = await context.params;

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
			questionType: true,
			options: {
				select: {
					id: true,
					optionText: true,
					isCorrect: true,
					orderIndex: true
				},
				orderBy: {
					orderIndex: 'asc'
				}
			}
		}
	});

	const maxQuestions = questions.length;

	// 🧮 How many answered so far
	const answeredCount = await prisma.attemptAnswer.count({
		where: {
			attemptId
		}
	});

	// Base current question index:
	// - If some questions pending → next unanswered question
	// - If all answered           → keep student on last question, let them decide when to submit
	let safeIndex = maxQuestions > 0 ? Math.min(answeredCount, maxQuestions - 1) : 0;

	// If client requested a specific index and it's within bounds, honor it
	if (indexParam !== null && maxQuestions > 0) {
		const requested = Number.parseInt(indexParam, 10);
		if (!Number.isNaN(requested) && requested >= 0 && requested < maxQuestions) {
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
			maxQuestions,
			remainingSeconds,
			question: {
				id: currentQuestion.id,
				text: currentQuestion.questionText,
				questionType: currentQuestion.questionType,
				options: currentQuestion.options.map((opt) => ({
					id: opt.id,
					text: opt.optionText,
					orderIndex: opt.orderIndex,
					isCorrect: opt.isCorrect
				}))
			},
			selectedOptionId: savedAnswer?.selectedOptionId ?? null
		})
	);
});

// Backward-compatible alias (older routes referenced this name)
export const getPendingAttempt = getAttempt;
