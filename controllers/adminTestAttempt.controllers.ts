import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { logEvent } from '@/utils/log-event';
import { requireRole } from '@/utils/auth-guard';
import { asyncHandler, asyncHandlerWithContext } from '@/utils/async-handler';

// 📋 ADMIN APIs - Test Attempts Management

export const getTestAttempts = asyncHandler('GetTestAttempts', async (request) => {
	// 🔐 Admin authorization
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 📊 Fetch all test attempts with detailed information
	const testAttempts = await prisma.testAttempt.findMany({
		select: {
			id: true,
			studentId: true,
			testId: true,
			startedAt: true,
			submittedAt: true,
			score: true,
			status: true,
			student: {
				select: {
					id: true,
					provisionalNo: true,
					name: true,
					email: true
				}
			},
			test: {
				select: {
					id: true,
					title: true,
					maxQuestions: true,
					durationMinutes: true,
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
				}
			},
			_count: {
				select: {
					answers: true
				}
			}
		},
		orderBy: {
			startedAt: 'desc'
		}
	});

	// 📈 Format response with calculated fields
	const formattedAttempts = testAttempts.map((attempt) => ({
		id: attempt.id,
		studentId: attempt.studentId,
		testId: attempt.testId,
		student: attempt.student,
		test: {
			id: attempt.test.id,
			title: attempt.test.title,
			maxQuestions: attempt.test.maxQuestions,
			durationMinutes: attempt.test.durationMinutes,
			chapter: attempt.test.chapter
		},
		startedAt: attempt.startedAt,
		submittedAt: attempt.submittedAt,
		score: attempt.score,
		status: attempt.status,
		answeredQuestions: attempt._count.answers,
		maxQuestions: attempt.test.maxQuestions
	}));

	return NextResponse.json(
		new ApiResponse(200, formattedAttempts, 'Test attempts fetched successfully'),
		{ status: 200 }
	);
});

export const getTestAttemptById = asyncHandlerWithContext(
	'GetTestAttemptById',
	async (request, context) => {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { attemptId } = await context.params;

		if (!attemptId) {
			throw new ApiError(400, 'Attempt ID is required');
		}

		// 📌 Fetch attempt with full details
		const attempt = await prisma.testAttempt.findUnique({
			where: { id: attemptId },
			select: {
				id: true,
				studentId: true,
				testId: true,
				startedAt: true,
				submittedAt: true,
				score: true,
				status: true,
				student: {
					select: {
						id: true,
						provisionalNo: true,
						name: true,
						email: true,
						mobileNo: true
					}
				},
				test: {
					select: {
						id: true,
						title: true,
						maxQuestions: true,
						durationMinutes: true,
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
					}
				},
				answers: {
					select: {
						id: true,
						questionId: true,
						selectedOptionId: true,
						isCorrect: true,
						answeredAt: true,
						question: {
							select: {
								id: true,
								questionText: true,
								questionType: true,
								options: {
									select: {
										id: true,
										optionText: true,
										isCorrect: true,
										orderIndex: true
									}
								}
							}
						}
					},
					orderBy: {
						answeredAt: 'asc'
					}
				}
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Test attempt not found');
		}

		// 📊 Calculate statistics
		const totalAnswered = attempt.answers.length;
		const correctAnswers = attempt.answers.filter((a) => a.isCorrect === true).length;
		const timeTakenMinutes =
			attempt.submittedAt ?
				Math.ceil(
					(new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) /
						(1000 * 60)
				)
			:	null;

		return NextResponse.json(
			new ApiResponse(
				200,
				{
					id: attempt.id,
					student: attempt.student,
					test: attempt.test,
					startedAt: attempt.startedAt,
					submittedAt: attempt.submittedAt,
					score: attempt.score,
					status: attempt.status,
					statistics: {
						maxQuestions: attempt.test.maxQuestions,
						totalAnswered,
						correctAnswers,
						skippedQuestions: attempt.test.maxQuestions - totalAnswered,
						accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
						timeTakenMinutes
					},
					answers: attempt.answers
				},
				'Test attempt fetched successfully'
			),
			{ status: 200 }
		);
	}
);

export const deleteTestAttempt = asyncHandlerWithContext(
	'DeleteTestAttempt',
	async (request, context) => {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { attemptId } = await context.params;

		if (!attemptId) {
			throw new ApiError(400, 'Attempt ID is required');
		}

		// ✅ Verify attempt exists
		const attempt = await prisma.testAttempt.findUnique({
			where: { id: attemptId },
			select: {
				id: true,
				studentId: true,
				testId: true,
				student: {
					select: {
						name: true,
						email: true
					}
				},
				test: {
					select: {
						title: true
					}
				}
			}
		});

		if (!attempt) {
			throw new ApiError(404, 'Test attempt not found');
		}

		// 🗑️ Delete attempt (cascades to AttemptAnswers)
		await prisma.testAttempt.delete({
			where: { id: attemptId }
		});

		// 🧾 Audit log
		logEvent('TestAttemptDeleted', {
			adminId,
			attemptId: attempt.id,
			studentId: attempt.studentId,
			testId: attempt.testId,
			studentName: attempt.student.name,
			testTitle: attempt.test.title
		});

		return NextResponse.json(new ApiResponse(200, null, 'Test attempt deleted successfully'), {
			status: 200
		});
	}
);

// 📊 ADMIN APIs - Student Results

export const getStudentResults = asyncHandlerWithContext(
	'GetStudentResults',
	async (request, context) => {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId } = await context.params;

		if (!studentId) {
			throw new ApiError(400, 'Student ID is required');
		}

		// ✅ Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: {
				id: true,
				provisionalNo: true,
				name: true,
				email: true,
				registeredAt: true
			}
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// 📋 Fetch all test attempts for the student
		const testAttempts = await prisma.testAttempt.findMany({
			where: { studentId },
			select: {
				id: true,
				testId: true,
				startedAt: true,
				submittedAt: true,
				score: true,
				status: true,
				test: {
					select: {
						id: true,
						title: true,
						maxQuestions: true,
						durationMinutes: true,
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
					}
				},
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

		// 📊 Calculate overall statistics
		const completedAttempts = testAttempts.filter((attempt) => attempt.status === 'COMPLETED');
		const totalScore = completedAttempts.reduce(
			(totalScore, attempt) => totalScore + (attempt.score || 0),
			0
		);
		const averageScore =
			completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0;

		// 📈 Format detailed results by course
		const resultsByCourse = await prisma.enrollment.findMany({
			where: { studentId },
			select: {
				courseId: true,
				course: {
					select: {
						id: true,
						title: true,
						chapters: {
							select: {
								id: true,
								code: true,
								title: true,
								tests: {
									select: {
										id: true,
										title: true
									}
								}
							}
						}
					}
				}
			}
		});

		// 🔗 Map attempts to courses
		const courseResults = resultsByCourse.map((enrollment) => {
			const courseAllTest = enrollment.course.chapters.flatMap((chapter) =>
				chapter.tests.map((test) => test.id)
			);
			const courseTestAttempts = testAttempts.filter((attempt) =>
				courseAllTest.includes(attempt.testId)
			);
			const courseAllCompletedTestAttempts = courseTestAttempts.filter(
				(a) => a.status === 'COMPLETED'
			);

			const courseAllTestTotalScore = courseAllCompletedTestAttempts.reduce(
				(totalScore, attempt) => totalScore + (attempt.score || 0),
				0
			);

			const courseAllTestTotalScoreAverage =
				courseAllCompletedTestAttempts.length > 0 ?
					Math.round(courseAllTestTotalScore / courseAllCompletedTestAttempts.length)
				:	0;

			return {
				courseId: enrollment.course.id,
				courseTitle: enrollment.course.title,
				totalTests: courseAllTest.length,
				attemptedTests: courseTestAttempts.length,
				completedTests: courseAllCompletedTestAttempts.length,
				averageScore: courseAllTestTotalScoreAverage,
				chapters: enrollment.course.chapters.map((chapter) => ({
					id: chapter.id,
					code: chapter.code,
					title: chapter.title,
					tests: chapter.tests.length,
					attempts: courseTestAttempts.filter((attempt) => attempt.test.chapter.id === chapter.id)
						.length
				}))
			};
		});

		return NextResponse.json(
			new ApiResponse(
				200,
				{
					student,
					summary: {
						totalAttempts: testAttempts.length,
						completedAttempts: completedAttempts.length,
						pendingAttempts: testAttempts.filter((attempt) => attempt.status === 'IN_PROGRESS')
							.length,
						averageScore,
						totalScore
					},
					courseResults,
					recentAttempts: testAttempts.slice(0, 10).map((attempt) => ({
						id: attempt.id,
						testTitle: attempt.test.title,
						courseName: attempt.test.chapter.course.title,
						startedAt: attempt.startedAt,
						submittedAt: attempt.submittedAt,
						score: attempt.score,
						status: attempt.status,
						answeredQuestions: attempt._count.answers,
						maxQuestions: attempt.test.maxQuestions,
						accuracy:
							attempt._count.answers > 0 ?
								Math.round(
									(attempt.answers.filter((answer) => answer.isCorrect === true).length /
										attempt._count.answers) *
										100
								)
							:	0
					}))
				},
				'Student results fetched successfully'
			),
			{ status: 200 }
		);
	}
);
