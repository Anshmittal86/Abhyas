import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createChapterSchema, updateChapterSchema } from '@/validators/chapter.validator';
import { requireRole } from '@/utils/auth-guard';

export async function createChapter(request: NextRequest) {
	try {
		// 🔐 Admin id from middleware
		// const adminId = request.headers.get('x-user-id');
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
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

export async function getChapters(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📋 Fetch all chapters with course info
		const chapters = await prisma.chapter.findMany({
			select: {
				id: true,
				code: true,
				title: true,
				orderNo: true,
				_count: {
					select: {
						tests: true
					}
				},
				course: {
					select: {
						id: true,
						title: true
					}
				}
			},
			orderBy: {
				orderNo: 'asc'
			}
		});

		// 📊 Format response with enrollment count
		const formattedChapters = chapters.map((Chapter) => ({
			id: Chapter.id,
			code: Chapter.code,
			title: Chapter.title,
			orderNo: Chapter.orderNo,
			testCount: Chapter._count.tests,
			course: {
				id: Chapter.course.id,
				title: Chapter.course.title
			}
		}));

		return NextResponse.json(
			new ApiResponse(200, formattedChapters, 'Chapters fetched successfully'),
			{
				status: 200
			}
		);
	} catch (error) {
		return handleError('GetChapters', error);
	}
}
export async function getChapterById(
	request: NextRequest,
	{ params }: { params: Promise<{ chapterId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { chapterId } = await params;

		if (!chapterId) {
			throw new ApiError(400, 'Chapter ID is required');
		}

		const chapter = await prisma.chapter.findFirst({
			where: {
				id: chapterId,
				adminId
			},
			select: {
				id: true,
				code: true,
				title: true,
				orderNo: true,
				admin: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
				course: {
					select: {
						id: true,
						title: true,
						description: true
					}
				},
				tests: {
					select: {
						id: true,
						title: true,
						totalQuestions: true,
						durationMinutes: true
					}
				}
			}
		});

		if (!chapter) {
			throw new ApiError(404, 'Chapter not found');
		}

		return NextResponse.json(new ApiResponse(200, chapter, 'Chapter fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetChapterById', error);
	}
}

export async function updateChapter(
	request: NextRequest,
	{ params }: { params: Promise<{ chapterId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { chapterId } = await params;

		if (!chapterId) {
			throw new ApiError(400, 'Chapter ID is required');
		}

		// 🔍 Verify chapter exists & belongs to admin
		const chapter = await prisma.chapter.findFirst({
			where: {
				id: chapterId,
				adminId
			}
		});

		if (!chapter) {
			throw new ApiError(404, 'Chapter not found or access denied');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { code, title, orderNo } = updateChapterSchema.parse(body);

		// 🧠 Update chapter
		const updatedChapter = await prisma.chapter.update({
			where: {
				id: chapterId
			},
			data: {
				code,
				title,
				orderNo
			}
		});

		// 🧾 Audit log
		logEvent('ChapterUpdated', {
			adminId,
			chapterId: updatedChapter.id,
			courseId: updatedChapter.courseId,
			title: updatedChapter.title
		});

		return NextResponse.json(new ApiResponse(200, updatedChapter, 'Chapter updated successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('UpdateChapter', error);
	}
}

export async function deleteChapter(
	request: NextRequest,
	{ params }: { params: Promise<{ chapterId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { chapterId } = await params;

		if (!chapterId) {
			throw new ApiError(400, 'Chapter ID is required');
		}

		// 🔍 Verify chapter exists & belongs to admin
		const chapter = await prisma.chapter.findFirst({
			where: {
				id: chapterId,
				adminId
			}
		});

		if (!chapter) {
			throw new ApiError(404, 'Chapter not found or access denied');
		}

		// 🗑️ Delete chapter (cascades handled by database)
		await prisma.chapter.delete({
			where: {
				id: chapterId
			}
		});

		// 🧾 Audit log
		logEvent('ChapterDeleted', {
			adminId,
			chapterId: chapter.id,
			courseId: chapter.courseId,
			title: chapter.title
		});

		return NextResponse.json(new ApiResponse(200, null, 'Chapter deleted successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('DeleteChapter', error);
	}
}
