import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';
import { requireRole } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';

/**
 * Get student test history per chapter
 * GET /api/student/chapters/:chapterId/tests
 */
export async function getChapterTests(
	request: NextRequest,
	{ params }: { params: Promise<{ chapterId: string }> }
) {
	try {
		// 🔐 Auth - Student only
		const { userId: studentId } = requireRole(request, ['student']);

		if (!studentId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { chapterId } = await params;

		if (!chapterId) {
			throw new ApiError(400, 'Chapter ID is required');
		}

		// ✅ Verify chapter exists
		const chapter = await prisma.chapter.findUnique({
			where: { id: chapterId },
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
		});

		if (!chapter) {
			throw new ApiError(404, 'Chapter not found');
		}

		// ✅ Verify student is enrolled in the course
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId: chapter.course.id
				}
			}
		});

		if (!enrollment) {
			throw new ApiError(403, 'Not enrolled in this course');
		}

		// 📋 Fetch all tests in this chapter
		const tests = await prisma.test.findMany({
			where: { chapterId },
			select: {
				id: true,
				title: true,
				totalQuestions: true,
				durationMinutes: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'asc'
			}
		});

		// 📊 Fetch all test attempts for these tests
		const testIds = tests.map((t) => t.id);
		const attempts = await prisma.testAttempt.findMany({
			where: {
				studentId,
				testId: { in: testIds }
			},
			select: {
				id: true,
				testId: true,
				startedAt: true,
				submittedAt: true,
				score: true,
				status: true,
				_count: {
					select: {
						answers: true
					}
				},
				answers: {
					select: {
						isCorrect: true
					}
				}
			},
			orderBy: {
				startedAt: 'desc'
			}
		});

		// 🔗 Map attempts to tests
		const testsWithHistory = tests.map((test) => {
			const testAttempts = attempts.filter((a) => a.testId === test.id);
			const submittedAttempts = testAttempts.filter((a) => a.submittedAt !== null);
			const latestAttempt = testAttempts[0] || null;

			const bestScore =
				submittedAttempts.length > 0 ?
					Math.max(...submittedAttempts.map((a) => a.score || 0))
				:	null;
			const averageScore =
				submittedAttempts.length > 0 ?
					Math.round(
						submittedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
							submittedAttempts.length
					)
				:	null;

			return {
				id: test.id,
				title: test.title,
				totalQuestions: test.totalQuestions,
				durationMinutes: test.durationMinutes,
				createdAt: test.createdAt,
				statistics: {
					totalAttempts: testAttempts.length,
					submittedAttempts: submittedAttempts.length,
					pendingAttempts: testAttempts.length - submittedAttempts.length,
					bestScore,
					averageScore,
					latestAttempt: latestAttempt ? {
						id: latestAttempt.id,
						startedAt: latestAttempt.startedAt,
						submittedAt: latestAttempt.submittedAt,
						score: latestAttempt.score,
						status: latestAttempt.status,
						answeredQuestions: latestAttempt._count.answers,
						accuracy:
							latestAttempt._count.answers > 0 ?
								Math.round(
									(latestAttempt.answers.filter((ans) => ans.isCorrect === true).length /
										latestAttempt._count.answers) *
										100
								)
							:	0
					} : null
				},
				attempts: testAttempts.map((attempt) => ({
					id: attempt.id,
					startedAt: attempt.startedAt,
					submittedAt: attempt.submittedAt,
					score: attempt.score,
					status: attempt.status,
					answeredQuestions: attempt._count.answers,
					accuracy:
						attempt._count.answers > 0 ?
							Math.round(
								(attempt.answers.filter((ans) => ans.isCorrect === true).length /
									attempt._count.answers) *
									100
							)
						:	0
				}))
			};
		});

		return NextResponse.json(
			new ApiResponse(
				200,
				{
					chapter: {
						id: chapter.id,
						code: chapter.code,
						title: chapter.title,
						course: chapter.course
					},
					tests: testsWithHistory,
					summary: {
						totalTests: tests.length,
						totalAttempts: attempts.length,
						submittedAttempts: attempts.filter((a) => a.submittedAt !== null).length
					}
				},
				'Chapter test history fetched successfully'
			),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetChapterTests', error);
	}
}
