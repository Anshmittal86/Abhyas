import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireRole } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { asyncHandlerWithContext } from '@/utils/async-handler';

/**
 * Get all questions for a test attempt with previous answers
 * GET /api/student/attempt/{attemptId}/all-questions
 */
export const getAttemptAllQuestions = asyncHandlerWithContext(
	'GetAttemptAllQuestions',
	async (request, context) => {
		// 🔐 Auth
		const { userId: studentId } = requireRole(request, ['student']);
		const { attemptId } = await context.params;

		if (!attemptId) {
			throw new ApiError(400, 'Attempt ID is required');
		}

		// 🔍 Fetch active attempt
		const attempt = await prisma.testAttempt.findFirst({
			where: {
				id: attemptId,
				studentId,
				submittedAt: null,
				status: 'IN_PROGRESS'
			},
			select: {
				id: true,
				testId: true,
				startedAt: true,
				expiresAt: true
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Active test attempt not found');
		}

		// ⏱️ Remaining time in seconds
		const remainingSeconds = Math.max(
			0,
			Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000)
		);

		// 📚 Fetch all questions for this test
		const questions = await prisma.question.findMany({
			where: {
				testId: attempt.testId,
				questionType: {
					in: ['MCQ', 'TRUE_FALSE'] // Only MCQ and TRUE_FALSE for now
				}
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
						orderIndex: true,
						isCorrect: true
					},
					orderBy: {
						orderIndex: 'asc'
					}
				}
			}
		});

		// 🔁 Fetch all previous answers for this attempt
		const previousAnswers = await prisma.attemptAnswer.findMany({
			where: {
				attemptId
			},
			select: {
				questionId: true,
				selectedOptionId: true
			}
		});

		// 🗺️ Map answers for quick lookup
		const answersMap = new Map(previousAnswers.map((a) => [a.questionId, a.selectedOptionId]));

		// 🎯 Format questions to match expected structure
		const formattedQuestions = questions.map((question) => {
			const formattedOptions = question.options.map((opt, index) => ({
				id: opt.id,
				text: opt.optionText,
				key: String.fromCharCode(65 + index) // A, B, C, D
			}));

			return {
				id: question.id,
				type: question.questionType === 'TRUE_FALSE' ? ('TRUE_FALSE' as const) : ('MCQ' as const),
				question: question.questionText,
				options: formattedOptions,
				correctAnswer: question.options.find((opt) => opt.isCorrect)?.id ?? null
			};
		});

		// 🔍 Get answered count
		const answeredCount = previousAnswers.length;

		// 🎯 Final response
		return NextResponse.json(
			new ApiResponse(
				200,
				{
					attemptId: attempt.id,
					testId: attempt.testId,
					questions: formattedQuestions,
					previousAnswers: Object.fromEntries(answersMap),
					answeredCount,
					totalQuestions: formattedQuestions.length,
					remainingSeconds,
					startedAt: attempt.startedAt,
					expiresAt: attempt.expiresAt
				},
				'Attempt questions fetched successfully'
			)
		);
	}
);
