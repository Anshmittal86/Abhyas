import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createCourseSchema } from '@/validators/course.validator';
import { requireRole } from '@/utils/auth-guard';

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

export async function getCourses(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📋 Fetch all courses with enrollment count
		const courses = await prisma.course.findMany({
			where: {
				adminId
			},
			select: {
				id: true,
				title: true,
				description: true,
				duration: true,
				isActive: true,
				createdAt: true,
				_count: {
					select: {
						enrollments: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// 📊 Format response with enrollment count
		const formattedCourses = courses.map((course) => ({
			id: course.id,
			title: course.title,
			description: course.description,
			duration: course.duration,
			isActive: course.isActive,
			enrollmentCount: course._count.enrollments,
			createdAt: course.createdAt
		}));

		return NextResponse.json(
			new ApiResponse(200, formattedCourses, 'Courses fetched successfully'),
			{
				status: 200
			}
		);
	} catch (error) {
		return handleError('GetCourses', error);
	}
}
