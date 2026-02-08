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
		// 🔐 Auth
		const { userId: studentId } = requireRole(request, ['student']);
		const { attemptId } = await params;

		// 🔍 Fetch active attempt
		const attempt = await prisma.testAttempt.findFirst({
			where: {
				id: attemptId,
				studentId,
				status: 'IN_PROGRESS'
			},
			include: {
				test: {
					select: {
						title: true,
						durationMinutes: true
					}
				}
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Active test attempt not found');
		}

		// ⏱️ Calculate Remaining Time
		const remainingSeconds = getRemainingSeconds(attempt.expiresAt);

		// 📚 Fetch ALL Questions & ALL saved Answers in Parallel
		const [allQuestions, allAnswers] = await Promise.all([
			prisma.question.findMany({
				where: { testId: attempt.testId },
				orderBy: { createdAt: 'asc' }, // Stable order
				select: {
					id: true,
					questionText: true,
					optionA: true,
					optionB: true,
					optionC: true,
					optionD: true
					// ⚠️ correctOption explicitly excluded for security
				}
			}),
			prisma.attemptAnswer.findMany({
				where: { attemptId },
				select: {
					questionId: true,
					selectedOption: true
				}
			})
		]);

		if (allQuestions.length === 0) {
			throw new ApiError(404, 'No questions found for this test');
		}

		// 4. 🧩 Merge Questions with Student's Previous Answers
		const questionsWithState = allQuestions.map((q) => {
			const savedAnswer = allAnswers.find((a) => a.questionId === q.id);
			return {
				id: q.id,
				text: q.questionText,
				options: [
					{ key: 'A', text: q.optionA },
					{ key: 'B', text: q.optionB },
					{ key: 'C', text: q.optionC },
					{ key: 'D', text: q.optionD }
				],
				selectedOption: savedAnswer?.selectedOption ?? null,
				isAnswered: !!savedAnswer?.selectedOption
			};
		});

		// 5. 🎯 Send Response
		return NextResponse.json(
			new ApiResponse(
				200,
				{
					attemptId: attempt.id,
					testId: attempt.testId,
					testTitle: attempt.test.title,
					remainingSeconds,
					totalQuestions: questionsWithState.length,
					questions: questionsWithState
				},
				'Test attempt details fetched successfully'
			),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetAttempt', error);
	}
}

// Backward-compatible alias (older routes referenced this name)
export const getPendingAttempt = getAttempt;
