import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createQuestionSchema } from '@/validators/question.validator';

export async function createQuestion(request: NextRequest) {
	try {
		// 🔐 Admin id from middleware
		const adminId = request.headers.get('x-user-id');
		if (!adminId) {
			throw new ApiError(401, 'Unauthorized');
		}

		// 📦 Validate request body
		const body = await request.json();
		const { testId, questionText, optionA, optionB, optionC, optionD, correctOption } =
			createQuestionSchema.parse(body);

		// ✅ Check test exists & belongs to admin
		const test = await prisma.test.findFirst({
			where: { id: testId, adminId }
		});

		if (!test) {
			throw new ApiError(404, 'Test not found or access denied');
		}

		// 🧠 Create question
		const question = await prisma.question.create({
			data: {
				testId,
				adminId,
				questionText,
				optionA,
				optionB,
				optionC,
				optionD,
				correctOption // Prisma enum OptionChoice will accept "A" | "B" | "C" | "D"
			}
		});

		// 🧾 Audit log
		logEvent('QuestionCreated', {
			adminId,
			testId,
			questionId: question.id
		});

		return NextResponse.json(new ApiResponse(201, question, 'Question created successfully'), {
			status: 201
		});
	} catch (error) {
		return handleError('CreateQuestion', error);
	}
}
