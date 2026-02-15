import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { courseSchema } from '@/validators/course.validator';
import { requireRole } from '@/utils/auth-guard';

export async function createCourse(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		// const adminId = request.headers.get('x-user-id');
		// if (!adminId) {
		//   throw new ApiError(401, 'Unauthorized');
		// }
		const { userId: adminId, userRole } = requireRole(request, ['admin']);

		if (!adminId || userRole !== 'admin') {
			throw new ApiError(401, 'Unauthorized Access');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { title, description, duration, isActive } = courseSchema.parse(body);

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

export async function getCourseById(
	request: NextRequest,
	{ params }: { params: Promise<{ courseId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { courseId } = await params;

		if (!courseId) {
			throw new ApiError(400, 'Course ID is required');
		}

		const course = await prisma.course.findUnique({
			where: {
				id: courseId
			},
			select: {
				id: true,
				title: true,
				description: true,
				duration: true,
				isActive: true,
				createdAt: true,
				admin: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
				enrollments: {
					select: {
						id: true,
						enrolledAt: true,
						student: {
							select: {
								id: true,
								provisionalNo: true,
								name: true,
								email: true,
								isActive: true,
								registeredAt: true
							}
						}
					}
				},
				chapters: {
					select: {
						id: true,
						code: true,
						title: true,
						orderNo: true
					},
					orderBy: {
						orderNo: 'asc'
					}
				}
			}
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		return NextResponse.json(new ApiResponse(200, course, 'Course fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetCourseById', error);
	}
}

export async function updateCourse(
	request: NextRequest,
	{ params }: { params: Promise<{ courseId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { courseId } = await params;

		if (!courseId) {
			throw new ApiError(400, 'Course ID is required');
		}

		const course = await prisma.course.findFirst({
			where: {
				id: courseId
			}
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		const body = await request.json();
		const { title, description, duration, isActive } = courseSchema.parse(body);

		const updatedCourse = await prisma.course.update({
			where: {
				id: courseId
			},
			data: {
				title,
				description,
				duration,
				isActive
			}
		});

		logEvent('CourseUpdated', {
			adminId,
			courseId: updatedCourse.id,
			title: updatedCourse.title
		});

		return NextResponse.json(new ApiResponse(200, updatedCourse, 'Course updated successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('UpdateCourse', error);
	}
}

export async function deleteCourse(
	request: NextRequest,
	{ params }: { params: Promise<{ courseId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { courseId } = await params;
		if (!courseId) {
			throw new ApiError(400, 'Course ID is required');
		}

		const course = await prisma.course.findFirst({
			where: {
				id: courseId
			}
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		await prisma.course.delete({
			where: {
				id: courseId
			}
		});

		logEvent('CourseDeleted', {
			adminId,
			courseId: course.id,
			title: course.title
		});

		return NextResponse.json(new ApiResponse(200, null, 'Course deleted successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('DeleteCourse', error);
	}
}

export async function toggleCourseActivation(
	request: NextRequest,
	{ params }: { params: Promise<{ courseId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { courseId } = await params;
		if (!courseId) {
			throw new ApiError(400, 'Course ID is required');
		}

		const course = await prisma.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		const newStatus = !course.isActive;
		const action = newStatus ? 'activated' : 'deactivated';

		await prisma.course.update({
			where: { id: courseId },
			data: { isActive: newStatus }
		});

		return NextResponse.json(
			new ApiResponse(
				200,
				{ id: courseId, isActive: newStatus, title: course.title },
				`Course ${action} successfully`
			),
			{ status: 200 }
		);
	} catch (error) {
		handleError('toggleCourseActivation', error);
	}
}
