import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { asyncHandler, asyncHandlerWithContext } from '@/utils/async-handler';
import { logEvent } from '@/utils/log-event';

import { createTestSchema, updateTestSchema } from '@/validators/test.validator';
import { requireRole } from '@/utils/auth-guard';

export const createTest = asyncHandler('CreateTest', async (request) => {
	// 🔐 Admin id from middleware
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 📦 Validate request body
	const body = await request.json();
	const { chapterId, title, durationMinutes, maxQuestions } = createTestSchema.parse(body);

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
			maxQuestions,
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
});

export const getTests = asyncHandler('GetTests', async (request) => {
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
			maxQuestions: true,
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
			},
			createdAt: true
		},
		orderBy: {
			createdAt: 'asc'
		}
	});

	// 📊 Format response
	const formattedTests = tests.map((test) => ({
		id: test.id,
		title: test.title,
		durationMinutes: test.durationMinutes,
		maxQuestions: test.maxQuestions,
		questionCount: test._count.questions,
		attemptCount: test._count.attempts,
		chapter: {
			id: test.chapter.id,
			code: test.chapter.code,
			title: test.chapter.title,
			course: test.chapter.course
		},
		createdAt: test.createdAt
	}));

	return NextResponse.json(new ApiResponse(200, formattedTests, 'Tests fetched successfully'), {
		status: 200
	});
});

export const getTestById = asyncHandlerWithContext('GetTestById', async (request, context) => {
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	const { testId } = await context.params;

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
			maxQuestions: true,
			createdAt: true,
			updatedAt: true,
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
							description: true,
							duration: true,
							isActive: true
						}
					}
				}
			},

			questions: {
				select: {
					id: true,
					questionText: true,
					questionType: true
				},
				orderBy: {
					createdAt: 'asc'
				},
				take: 5 // Limit to 5 questions for preview
			},

			_count: {
				select: {
					questions: true,
					attempts: true
				}
			}
		}
	});

	if (!test) {
		throw new ApiError(404, 'Test not found');
	}

	const formattedTest = {
		id: test.id,
		title: test.title,
		durationMinutes: test.durationMinutes,
		maxQuestions: test.maxQuestions,

		questionCount: test._count.questions,
		attemptCount: test._count.attempts,

		createdAt: test.createdAt,
		updatedAt: test.updatedAt,

		admin: {
			id: test.admin.id,
			name: test.admin.name,
			email: test.admin.email
		},

		chapter: {
			id: test.chapter.id,
			code: test.chapter.code,
			title: test.chapter.title,
			course: {
				id: test.chapter.course.id,
				title: test.chapter.course.title,
				description: test.chapter.course.description,
				duration: test.chapter.course.duration,
				isActive: test.chapter.course.isActive
			}
		},
		questions: test.questions.map((q) => ({
			id: q.id,
			questionText: q.questionText,
			questionType: q.questionType
		}))
	};

	return NextResponse.json(new ApiResponse(200, formattedTest, 'Test fetched successfully'), {
		status: 200
	});
});

export const updateTest = asyncHandlerWithContext('UpdateTest', async (request, context) => {
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	const { testId } = await context.params;

	if (!testId) {
		throw new ApiError(400, 'Test ID is required');
	}

	const existingTest = await prisma.test.findFirst({
		where: {
			id: testId,
			adminId
		}
	});

	if (!existingTest) {
		throw new ApiError(404, 'Test not found or access denied');
	}

	// 📦 Parse & validate request body
	const body = await request.json();
	const { title } = updateTestSchema.parse(body);

	// 🧠 Update test
	const updatedTest = await prisma.test.update({
		where: {
			id: testId
		},
		data: {
			title
		}
	});

	// 🧾 Audit log
	logEvent('TestTitleUpdated', {
		adminId,
		testId: updatedTest.id,
		oldTitle: existingTest.title,
		newTitle: updatedTest.title
	});

	return NextResponse.json(new ApiResponse(200, updatedTest, 'Test title updated successfully'), {
		status: 200
	});
});

export const deleteTest = asyncHandlerWithContext('DeleteTest', async (request, context) => {
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	const { testId } = await context.params;

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
});

export const getTestQuestionProgress = asyncHandlerWithContext(
	'GetTestQuestionProgress',
	async (request, context) => {
		// 🔐 Auth Guard
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { testId } = await context.params;

		if (!testId) {
			throw new ApiError(400, 'Test ID is required');
		}

		// ⚡ Optimized query (only fetch required fields)
		const test = await prisma.test.findFirst({
			where: {
				id: testId,
				adminId
			},
			select: {
				id: true,
				title: true,
				maxQuestions: true,

				_count: {
					select: {
						questions: true
					}
				}
			}
		});

		if (!test) {
			throw new ApiError(404, 'Test not found or access denied');
		}

		const questionCount = test._count.questions;
		const remainingQuestions = test.maxQuestions - questionCount;
		const progressPercentage =
			test.maxQuestions === 0 ? 0 : Math.floor((questionCount / test.maxQuestions) * 100);

		const progress = {
			testId: test.id,
			title: test.title,
			maxQuestions: test.maxQuestions,

			questionCount,
			remainingQuestions,
			progressPercentage,

			isCompleted: questionCount >= test.maxQuestions
		};

		return NextResponse.json(
			new ApiResponse(200, progress, 'Test question progress fetched successfully'),
			{
				status: 200
			}
		);
	}
);
