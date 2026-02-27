import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { requireRole } from '@/utils/auth-guard';
import { asyncHandler } from '@/utils/async-handler';

export const getAdminDashboard = asyncHandler('GetAdminDashboard', async (request) => {
	const { userId } = requireRole(request, ['admin']);

	if (!userId) {
		throw new ApiError(401, 'Unauthorized Access');
	}

	const admin = await prisma.admin.findUnique({
		where: {
			id: userId
		}
	});

	if (!admin) {
		throw new ApiError(404, 'Admin not found');
	}

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const [totalStudents, totalTests, totalQuestions, todayAttempts, recentAttempts, tests] =
		await Promise.all([
			prisma.student.count(),

			prisma.test.count({
				where: { adminId: userId }
			}),

			prisma.question.count({
				where: { adminId: userId }
			}),

			prisma.testAttempt.count({
				where: { startedAt: { gte: todayStart } }
			}),

			prisma.testAttempt.findMany({
				include: {
					student: { select: { name: true } },
					test: { select: { title: true } }
				},
				take: 4,
				orderBy: { startedAt: 'desc' }
			}),

			prisma.test.findMany({
				where: { adminId: userId },
				select: {
					id: true,
					title: true,
					maxQuestions: true,
					_count: { select: { questions: true } }
				},
				orderBy: {
					createdAt: 'desc'
				}
			})
		]);

	const recentActivities = recentAttempts.map((attempt) => ({
		studentName: attempt.student.name,
		testTitle: attempt.test.title,
		score: attempt.score,
		status: attempt.status,
		submittedAt: attempt.submittedAt
	}));

	const testsWithQuestionCount = tests.map((test) => ({
		id: test.id,
		title: test.title,
		maxQuestions: test.maxQuestions,
		currentQuestionCount: test._count.questions
	}));

	return NextResponse.json(
		new ApiResponse(
			200,
			{
				stats: {
					totalStudents,
					totalTests,
					totalQuestions,
					todayAttempts
				},
				recentActivities,
				testsWithQuestionCount
			},
			'Admin dashboard data fetched'
		)
	);
});

export const getAdminLogs = asyncHandler('GetAdminLogs', async (request) => {
	// 🔐 Admin authorization
	const { userId: adminId, userRole } = requireRole(request, ['admin']);

	if (!adminId || userRole !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 🔎 Query params
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 20);
	const skip = (page - 1) * limit;

	const action = searchParams.get('action');
	const entityType = searchParams.get('entityType');

	// 🧠 Filters
	const whereClause: any = {
		adminId
	};

	if (action) whereClause.action = action;
	if (entityType) whereClause.entityType = entityType;

	// 📊 Fetch logs
	const [logs, totalCount] = await Promise.all([
		prisma.adminLog.findMany({
			where: whereClause,
			orderBy: {
				createdAt: 'desc'
			},
			skip,
			take: limit,
			select: {
				id: true,
				action: true,
				entityType: true,
				entityId: true,
				description: true,
				createdAt: true,
				admin: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		}),
		prisma.adminLog.count({
			where: whereClause
		})
	]);

	return NextResponse.json(
		new ApiResponse(
			200,
			{
				data: logs,
				pagination: {
					page,
					limit,
					totalPages: Math.ceil(totalCount / limit),
					totalRecords: totalCount
				}
			},
			'Admin logs fetched successfully'
		),
		{ status: 200 }
	);
});
