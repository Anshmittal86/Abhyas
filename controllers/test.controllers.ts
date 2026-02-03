import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createTestSchema, updateTestSchema } from '@/validators/test.validator';
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

export async function getTests(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📋 Fetch all tests with chapter info
		const tests = await prisma.test.findMany({
			select: {
				id: true,
				title: true,
				durationMinutes: true,
				totalQuestions: true,
				_count: {
					select: {
						questions: true,
						attempts: true
					}
				},
				chapter: {
					select: {
						id: true,
						code: true,
						title: true,
						course: {
							select: {
								id: true,
								title: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// 📊 Format response
		const formattedTests = tests.map((test) => ({
			id: test.id,
			title: test.title,
			durationMinutes: test.durationMinutes,
			totalQuestions: test.totalQuestions,
			questionCount: test._count.questions,
			attemptCount: test._count.attempts,
			chapter: {
				id: test.chapter.id,
				code: test.chapter.code,
				title: test.chapter.title,
				course: test.chapter.course
			}
		}));

		return NextResponse.json(new ApiResponse(200, formattedTests, 'Tests fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetTests', error);
	}
}

export async function getTestById(
	request: NextRequest,
	{ params }: { params: Promise<{ testId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { testId } = await params;

		if (!testId) {
			throw new ApiError(400, 'Test ID is required');
		}

		const test = await prisma.test.findFirst({
			where: {
				id: testId,
				adminId
			},
			select: {
				id: true,
				title: true,
				durationMinutes: true,
				totalQuestions: true,
				createdAt: true,
				admin: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
				chapter: {
					select: {
						id: true,
						code: true,
						title: true,
						course: {
							select: {
								id: true,
								title: true,
								description: true
							}
						}
					}
				},
				questions: {
					select: {
						id: true,
						questionText: true,
						optionA: true,
						optionB: true,
						optionC: true,
						optionD: true,
						correctOption: true
					}
				},
				attempts: {
					select: {
						id: true,
						studentId: true,
						score: true,
						startedAt: true,
						submittedAt: true
					}
				}
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found');
		}

		return NextResponse.json(new ApiResponse(200, test, 'Test fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetTestById', error);
	}
}

export async function updateTest(
	request: NextRequest,
	{ params }: { params: Promise<{ testId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { testId } = await params;

		if (!testId) {
			throw new ApiError(400, 'Test ID is required');
		}

		// 🔍 Verify test exists & belongs to admin
		const test = await prisma.test.findFirst({
			where: {
				id: testId,
				adminId
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found or access denied');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { title, durationMinutes, totalQuestions } = updateTestSchema.parse(body);

		// 🧠 Update test
		const updatedTest = await prisma.test.update({
			where: {
				id: testId
			},
			data: {
				title,
				durationMinutes,
				totalQuestions
			}
		});

		// 🧾 Audit log
		logEvent('TestUpdated', {
			adminId,
			testId: updatedTest.id,
			chapterId: updatedTest.chapterId,
			title: updatedTest.title
		});

		return NextResponse.json(new ApiResponse(200, updatedTest, 'Test updated successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('UpdateTest', error);
	}
}

export async function deleteTest(
	request: NextRequest,
	{ params }: { params: Promise<{ testId: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { testId } = await params;

		if (!testId) {
			throw new ApiError(400, 'Test ID is required');
		}

		// 🔍 Verify test exists & belongs to admin
		const test = await prisma.test.findFirst({
			where: {
				id: testId,
				adminId
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found or access denied');
		}

		// 🗑️ Delete test (cascades handled by database)
		await prisma.test.delete({
			where: {
				id: testId
			}
		});

		// 🧾 Audit log
		logEvent('TestDeleted', {
			adminId,
			testId: test.id,
			chapterId: test.chapterId,
			title: test.title
		});

		return NextResponse.json(new ApiResponse(200, null, 'Test deleted successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('DeleteTest', error);
	}
}
