import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { saveAttemptAnswerSchema } from '@/validators/attemptAnswer.validator';
import { requireRole } from '@/utils/auth-guard';

export async function saveAttemptAnswer(
	request: NextRequest,
	context: { params: Promise<{ attemptId: string }> }
) {
	try {
		// 🔐 Student identity from middleware
		const { userId: studentId, userRole: role } = requireRole(request, ['student']);

		if (!studentId || role !== 'student') {
			throw new ApiError(401, 'Unauthorized');
		}

		const { attemptId } = await context.params;
		if (!attemptId) {
			throw new ApiError(400, 'Attempt id is required');
		}

		// 📦 Validate body
		const body = await request.json();
		const { questionId, selectedOption } = saveAttemptAnswerSchema.parse(body);

		// ✅ Check attempt exists and belongs to student
		const attempt = await prisma.testAttempt.findFirst({
			where: {
				id: attemptId,
				studentId
			},
			select: {
				id: true,
				testId: true,
				submittedAt: true
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Attempt not found');
		}

		// ❌ If already submitted, block changes
		if (attempt.submittedAt) {
			throw new ApiError(400, 'Attempt already submitted');
		}

		// ✅ Ensure question belongs to the same test
		const question = await prisma.question.findFirst({
			where: {
				id: questionId,
				testId: attempt.testId
			},
			select: {
				id: true,
				correctOption: true
			}
		});

		if (!question) {
			throw new ApiError(404, 'Question not found for this test');
		}

		// ✅ UPSERT answer (create or update)
		const answer = await prisma.attemptAnswer.upsert({
			where: {
				attemptId_questionId: {
					attemptId,
					questionId
				}
			},
			update: {
				selectedOption: selectedOption ?? null,
				answeredAt: new Date()
			},
			create: {
				attemptId,
				questionId,
				selectedOption: selectedOption ?? null,
				answeredAt: new Date()
			}
		});

		logEvent('AttemptAnswerSaved', {
			studentId,
			attemptId,
			questionId,
			selectedOption
		});

		return NextResponse.json(new ApiResponse(200, answer, 'Answer saved'), { status: 200 });
	} catch (error) {
		return handleError('SaveAttemptAnswer', error);
	}
}
