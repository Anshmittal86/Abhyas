import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { prisma } from '@/src/db/client';
import { requireRole } from '@/utils/auth-guard';

export async function showAvailableTest(request: NextRequest) {
	try {
		const { userId: studentId, userRole: role } = requireRole(request, ['student']);

		// Auth: only student allowed
		if (!studentId || role !== 'student') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// Find enrolled courses
		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId
			},
			select: {
				courseId: true
			}
		});

		if (enrollments.length === 0) {
			return NextResponse.json(new ApiResponse(200, [], 'No enrolled courses found'));
		}

		const courseIds = enrollments.map((e) => e.courseId);

		// Fetch tests linked to chapters of enrolled courses
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
				totalQuestions: true,
				chapter: {
					select: {
						title: true,
						course: {
							select: {
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

		// Shape response for frontend
		const formattedTests = tests.map((test) => ({
			id: test.id,
			title: test.title,
			chapterName: test.chapter.title,
			courseName: test.chapter.course.title,
			durationMinutes: test.durationMinutes,
			totalQuestions: test.totalQuestions
		}));

		return NextResponse.json(
			new ApiResponse(200, formattedTests, 'Available tests fetched successfully')
		);
	} catch (error) {
		return handleError('ShowAvailableTest', error);
	}
}
