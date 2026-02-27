import { NextResponse } from 'next/server';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { prisma } from '@/lib/db/client';
import { requireRole } from '@/utils/auth-guard';
import { asyncHandler } from '@/utils/async-handler';

export const getStudentTests = asyncHandler('GetStudentTests', async (request) => {
	const { userId: studentId, userRole: role } = requireRole(request, ['student']);

	if (!studentId || role !== 'student') {
		throw new ApiError(401, 'Unauthorized: Student access required');
	}

	const enrollments = await prisma.enrollment.findMany({
		where: {
			studentId
		},
		select: {
			courseId: true
		}
	});

	if (enrollments.length === 0) {
		return NextResponse.json(
			new ApiResponse(200, [], 'No enrolled courses found, hence no tests available')
		);
	}

	const courseIds = enrollments.map((e) => e.courseId);

	const tests = await prisma.test.findMany({
		where: {
			chapter: {
				courseId: {
					in: courseIds
				}
			}
		},

		select: {
			id: true,
			title: true,
			durationMinutes: true,
			totalMarks: true,
			maxQuestions: true,
			chapter: {
				select: {
					title: true,
					course: {
						select: { title: true }
					}
				}
			},

			_count: {
				select: {
					questions: true
				}
			},
			attempts: {
				where: { studentId },
				orderBy: { startedAt: 'desc' },
				select: {
					id: true,
					status: true,
					score: true,
					startedAt: true,
					submittedAt: true,
					expiresAt: true
				}
			}
		}
	});

	// Shape response for frontend
	const formatted = tests.map((test) => {
		const latestAttempt = test.attempts[0] ?? null;

		let tab: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = 'AVAILABLE';

		if (latestAttempt?.status === 'IN_PROGRESS') {
			const isExpired =
				latestAttempt.expiresAt && new Date(latestAttempt.expiresAt).getTime() < Date.now();

			tab = isExpired ? 'COMPLETED' : 'IN_PROGRESS';
		}

		if (latestAttempt?.status === 'COMPLETED') {
			tab = 'COMPLETED';
		}

		const gainedMarks =
			latestAttempt?.score !== null && latestAttempt?.score !== undefined ?
				Math.round((latestAttempt.score / 100) * test.totalMarks)
			:	0;

		return {
			testId: test.id,
			title: test.title,
			chapterName: test.chapter.title,
			courseName: test.chapter.course.title,
			durationMinutes: test.durationMinutes,
			maxMarks: test.totalMarks,
			maxQuestions: test.maxQuestions,
			questionCount: test._count.questions,

			attempt:
				latestAttempt ?
					{
						attemptId: latestAttempt.id,
						status: latestAttempt.status,
						score: latestAttempt.score,
						gainedMarks,
						startedAt: latestAttempt.startedAt,
						submittedAt: latestAttempt.submittedAt,
						expiresAt: latestAttempt.expiresAt
					}
				:	null,

			tab
		};
	});

	return NextResponse.json(new ApiResponse(200, formatted, 'Tests retrieved successfully'));
});
