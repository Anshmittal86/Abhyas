import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createTestSchema } from '@/validators/test.validator';
import { requireRole } from '@/utils/auth-guard';

export async function createTest(request: NextRequest) {
	try {
		// 🔐 Admin id from middleware
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📦 Validate request body
		const body = await request.json();
		const { chapterId, title, durationMinutes, totalQuestions } = createTestSchema.parse(body);

		// ✅ Check chapter exists & belongs to admin
		const chapter = await prisma.chapter.findFirst({
			where: {
				id: chapterId,
				adminId
			}
		});

		if (!chapter) {
			throw new ApiError(404, 'Chapter not found or access denied');
		}

		// 🧠 Create test
		const test = await prisma.test.create({
			data: {
				title,
				durationMinutes,
				totalQuestions,
				chapterId,
				adminId
			}
		});

		// 🧾 Audit log
		logEvent('TestCreated', {
			adminId,
			testId: test.id,
			chapterId,
			title: test.title
		});

		return NextResponse.json(new ApiResponse(201, test, 'Test created successfully'), {
			status: 201
		});
	} catch (error) {
		return handleError('CreateTest', error);
	}
}
