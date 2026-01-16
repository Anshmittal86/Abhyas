import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

export async function startTestAttempt(
	request: NextRequest,
	{ params }: { params: { testId: string } }
) {
	try {
		// 🔐 Student id from middleware
		const studentId = request.headers.get('x-user-id');
		const role = request.headers.get('x-user-role');

		if (!studentId || role !== 'student') {
			throw new ApiError(401, 'Unauthorized');
		}

		const testId = params.testId;
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

		// ✅ Check test exists
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

		// 🧠 Create attempt
		const attempt = await prisma.testAttempt.create({
			data: {
				studentId,
				testId
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
