import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createChapterSchema } from '@/validators/chapter.validator';

export async function createChapter(request: NextRequest) {
	try {
		// 🔐 Admin id from middleware
		const adminId = request.headers.get('x-user-id');
		if (!adminId) {
			throw new ApiError(401, 'Unauthorized');
		}

		// 📦 Validate request body
		const body = await request.json();
		const { courseId, code, title, orderNo } = createChapterSchema.parse(body);

		// 🧠 Ensure course exists & belongs to admin
		const course = await prisma.course.findFirst({
			where: {
				id: courseId,
				adminId,
				isActive: true
			}
		});

		if (!course) {
			throw new ApiError(404, 'Course not found or access denied');
		}

		// 🧾 Create chapter
		const chapter = await prisma.chapter.create({
			data: {
				code,
				title,
				orderNo,
				courseId,
				adminId
			}
		});

		// 📘 Audit log
		logEvent('ChapterCreated', {
			adminId,
			chapterId: chapter.id,
			courseId,
			title: chapter.title
		});

		return NextResponse.json(new ApiResponse(201, chapter, 'Chapter created successfully'), {
			status: 201
		});
	} catch (error) {
		return handleError('CreateChapter', error);
	}
}
