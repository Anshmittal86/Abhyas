import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { requireRole } from '@/utils/auth-guard';

export async function getAdminDashboard(request: NextRequest) {
	try {
		const { userId } = requireRole(request, ['admin']);

		if (!userId) {
			throw new ApiError(401, 'Unauthorized');
		}

		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);

		const [totalStudents, totalTests, totalQuestions, todayAttempts, recentAttempts] =
			await Promise.all([
				prisma.student.count(),
				prisma.test.count({ where: { adminId: userId } }),
				prisma.question.count({ where: { adminId: userId } }),
				prisma.testAttempt.count({
					where: { startedAt: { gte: todayStart } }
				}),
				prisma.testAttempt.findMany({
					orderBy: { startedAt: 'desc' },
					take: 5,
					include: {
						student: { select: { name: true } },
						test: { select: { title: true } }
					}
				})
			]);

		const recentActivity = recentAttempts.map((attempt) => ({
			studentName: attempt.student.name,
			testTitle: attempt.test.title,
			score: attempt.score,
			status: attempt.status
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
					recentActivity
				},
				'Admin dashboard data fetched'
			)
		);
	} catch (error) {
		return handleError('AdminDashboard', error);
	}
}

export async function getAdminLogs(request: NextRequest) {
	try {
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
	} catch (error) {
		return handleError('GetAdminLogs', error);
	}
}
