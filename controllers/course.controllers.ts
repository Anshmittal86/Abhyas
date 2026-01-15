import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createCourseSchema } from '@/validators/course.validator';

export async function createCourse(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		const adminId = request.headers.get('x-user-id');
		if (!adminId) {
			throw new ApiError(401, 'Unauthorized');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { title, description, duration, isActive } = createCourseSchema.parse(body);

		// 🧠 Create course
		const course = await prisma.course.create({
			data: {
				title,
				description,
				duration,
				isActive: isActive ?? true,
				adminId
			}
		});

		// 🧾 Audit log
		logEvent('CourseCreated', {
			adminId,
			courseId: course.id,
			title: course.title
		});

		return NextResponse.json(new ApiResponse(201, course, 'Course created successfully'), {
			status: 201
		});
	} catch (error) {
		return handleError('CreateCourse', error);
	}
}
