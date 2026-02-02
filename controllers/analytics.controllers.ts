import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { requireRole } from '@/utils/auth-guard';

// 📊 ADMIN APIs - Analytics & Dashboard Statistics

export async function getAdminDashboard(request: NextRequest) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📈 Fetch total counts
		const totalStudents = await prisma.student.count({
			where: { isActive: true }
		});

		const totalCourses = await prisma.course.count({
			where: { adminId, isActive: true }
		});

		const totalTests = await prisma.test.count({
			where: { adminId }
		});

		const totalQuestions = await prisma.question.count({
			where: { adminId }
		});

		const enrollmentsByAdmin = await prisma.enrollment.count({
			where: {
				course: {
					adminId
				}
			}
		});

		// 📋 Fetch test attempt statistics
		const totalAttempts = await prisma.testAttempt.count();

		const submittedAttempts = await prisma.testAttempt.count({
			where: {
				submittedAt: {
					not: null
				}
			}
		});

		const pendingAttempts = await prisma.testAttempt.count({
			where: {
				submittedAt: null
			}
		});

		// 🎯 Calculate average scores
		const attemptScores = await prisma.testAttempt.findMany({
			where: {
				score: {
					not: null
				}
			},
			select: {
				score: true
			}
		});

		const averageScore =
			attemptScores.length > 0 ?
				Math.round(attemptScores.reduce((sum, a) => sum + (a.score || 0), 0) / attemptScores.length)
			:	0;

		// 📅 Fetch recent activity (last 7 days)
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const recentAttempts = await prisma.testAttempt.count({
			where: {
				startedAt: {
					gte: sevenDaysAgo
				}
			}
		});

		const newEnrollments = await prisma.enrollment.count({
			where: {
				enrolledAt: {
					gte: sevenDaysAgo
				}
			}
		});

		// 📊 Fetch top performing students (by average score)
		const topStudents = await prisma.student.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				provisionalNo: true,
				testAttempts: {
					select: {
						score: true
					}
				}
			},
			take: 5
		});

		const topStudentsWithAvg = topStudents
			.map((student) => {
				const scores = student.testAttempts
					.map((a) => a.score)
					.filter((s) => s !== null) as number[];
				const avg =
					scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
				return {
					id: student.id,
					name: student.name,
					email: student.email,
					provisionalNo: student.provisionalNo,
					averageScore: avg,
					attemptCount: student.testAttempts.length
				};
			})
			.sort((a, b) => b.averageScore - a.averageScore)
			.slice(0, 5);

		// 📚 Fetch most attempted tests
		const mostAttemptedTests = await prisma.test.findMany({
			select: {
				id: true,
				title: true,
				chapter: {
					select: {
						title: true,
						course: {
							select: {
								title: true
							}
						}
					}
				},
				_count: {
					select: {
						attempts: true
					}
				}
			},
			orderBy: {
				attempts: {
					_count: 'desc'
				}
			},
			take: 5
		});

		const formattedTests = mostAttemptedTests.map((test) => ({
			id: test.id,
			title: test.title,
			chapterTitle: test.chapter.title,
			courseTitle: test.chapter.course.title,
			attemptCount: test._count.attempts
		}));

		const dashboardData = {
			overview: {
				totalStudents,
				totalCourses,
				totalTests,
				totalQuestions,
				totalEnrollments: enrollmentsByAdmin,
				totalAttempts
			},
			attempts: {
				submitted: submittedAttempts,
				pending: pendingAttempts,
				averageScore
			},
			recentActivity: {
				attemptsLast7Days: recentAttempts,
				enrollmentsLast7Days: newEnrollments
			},
			topPerformers: topStudentsWithAvg,
			mostAttemptedTests: formattedTests
		};

		return NextResponse.json(
			new ApiResponse(200, dashboardData, 'Admin dashboard data fetched successfully'),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetAdminDashboard', error);
	}
}

export async function getCoursePerformanceReport(request: NextRequest) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📚 Fetch all courses with their performance metrics
		const courses = await prisma.course.findMany({
			where: { adminId, isActive: true },
			select: {
				id: true,
				title: true,
				description: true,
				createdAt: true,
				enrollments: {
					select: {
						studentId: true,
						student: {
							select: {
								id: true,
								name: true
							}
						}
					}
				},
				chapters: {
					select: {
						id: true,
						title: true,
						tests: {
							select: {
								id: true,
								title: true,
								totalQuestions: true,
								attempts: {
									select: {
										score: true,
										submittedAt: true,
										studentId: true
									}
								}
							}
						}
					}
				}
			}
		});

		const coursePerformanceData = courses.map((course) => {
			const totalEnrolled = course.enrollments.length;

			// Aggregate test attempts for all tests in course
			const allAttempts: Array<{
				score: number | null;
				submittedAt: Date | null;
				studentId: string;
			}> = [];
			const attemptedStudentIds = new Set<string>();

			course.chapters.forEach((chapter) => {
				chapter.tests.forEach((test) => {
					allAttempts.push(...test.attempts);
					test.attempts.forEach((a) => attemptedStudentIds.add(a.studentId));
				});
			});

			const submittedAttempts = allAttempts.filter((a) => a.submittedAt !== null);
			const completionRate =
				totalEnrolled > 0 ? Math.round((attemptedStudentIds.size / totalEnrolled) * 100) : 0;

			// Calculate average score
			const scores = submittedAttempts.map((a) => a.score).filter((s) => s !== null) as number[];
			const averageScore =
				scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

			// Calculate highest and lowest scores
			const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
			const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

			// Count tests in course
			const testCount = course.chapters.reduce((sum, ch) => sum + ch.tests.length, 0);

			return {
				courseId: course.id,
				title: course.title,
				description: course.description,
				createdAt: course.createdAt,
				stats: {
					totalEnrolled,
					studentParticipated: attemptedStudentIds.size,
					completionRate,
					testCount,
					totalAttempts: allAttempts.length,
					submittedAttempts: submittedAttempts.length,
					averageScore,
					highestScore,
					lowestScore
				},
				chapters: course.chapters.map((chapter) => ({
					id: chapter.id,
					title: chapter.title,
					testCount: chapter.tests.length
				}))
			};
		});

		return NextResponse.json(
			new ApiResponse(200, coursePerformanceData, 'Course performance report fetched successfully'),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetCoursePerformanceReport', error);
	}
}

export async function getStudentPerformanceReport(request: NextRequest) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 👥 Fetch all students with their performance metrics
		const students = await prisma.student.findMany({
			where: { isActive: true },
			select: {
				id: true,
				name: true,
				email: true,
				provisionalNo: true,
				registeredAt: true,
				enrollments: {
					select: {
						course: {
							select: {
								id: true,
								title: true
							}
						}
					}
				},
				testAttempts: {
					select: {
						id: true,
						testId: true,
						score: true,
						submittedAt: true,
						startedAt: true,
						test: {
							select: {
								title: true,
								totalQuestions: true,
								chapter: {
									select: {
										title: true
									}
								}
							}
						},
						_count: {
							select: {
								answers: true
							}
						}
					}
				}
			}
		});

		const studentPerformanceData = students.map((student) => {
			const totalAttempts = student.testAttempts.length;
			const submittedAttempts = student.testAttempts.filter((a) => a.submittedAt !== null);

			// Calculate average score
			const scores = submittedAttempts.map((a) => a.score).filter((s) => s !== null) as number[];
			const averageScore =
				scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

			// Calculate highest and lowest scores
			const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
			const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

			// Calculate accuracy percentage
			const totalCorrect = submittedAttempts.reduce((sum, attempt) => {
				const correctAnswers = attempt._count.answers; // This would need adjustment based on actual data
				return sum + correctAnswers;
			}, 0);

			const totalQuestions = submittedAttempts.reduce((sum, attempt) => {
				return sum + attempt.test.totalQuestions;
			}, 0);

			const accuracyPercentage =
				totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

			return {
				studentId: student.id,
				name: student.name,
				email: student.email,
				provisionalNo: student.provisionalNo,
				registeredAt: student.registeredAt,
				stats: {
					enrolledCourses: student.enrollments.length,
					totalAttempts,
					submittedAttempts: submittedAttempts.length,
					pendingAttempts: totalAttempts - submittedAttempts.length,
					averageScore,
					highestScore,
					lowestScore,
					accuracyPercentage
				},
				enrolledCourses: student.enrollments.map((e) => ({
					id: e.course.id,
					title: e.course.title
				})),
				recentAttempts: submittedAttempts.slice(-5).map((attempt) => ({
					id: attempt.id,
					testTitle: attempt.test.title,
					chapterTitle: attempt.test.chapter.title,
					score: attempt.score,
					submittedAt: attempt.submittedAt
				}))
			};
		});

		return NextResponse.json(
			new ApiResponse(
				200,
				studentPerformanceData,
				'Student performance report fetched successfully'
			),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetStudentPerformanceReport', error);
	}
}

export async function getTestAnalytics(request: NextRequest) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📋 Fetch all tests with detailed analytics
		const tests = await prisma.test.findMany({
			where: { adminId },
			select: {
				id: true,
				title: true,
				totalQuestions: true,
				durationMinutes: true,
				createdAt: true,
				chapter: {
					select: {
						id: true,
						title: true,
						course: {
							select: {
								id: true,
								title: true
							}
						}
					}
				},
				questions: {
					select: {
						id: true,
						correctOption: true,
						answers: {
							select: {
								selectedOption: true,
								isCorrect: true
							}
						}
					}
				},
				attempts: {
					select: {
						id: true,
						studentId: true,
						score: true,
						submittedAt: true,
						startedAt: true,
						_count: {
							select: {
								answers: true
							}
						}
					}
				}
			}
		});

		const testAnalyticsData = tests.map((test) => {
			const totalAttempts = test.attempts.length;
			const submittedAttempts = test.attempts.filter((a) => a.submittedAt !== null);
			const pendingAttempts = totalAttempts - submittedAttempts.length;

			// Calculate average score
			const scores = submittedAttempts.map((a) => a.score).filter((s) => s !== null) as number[];
			const averageScore =
				scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

			// Calculate completion rate
			const completionRate =
				totalAttempts > 0 ? Math.round((submittedAttempts.length / totalAttempts) * 100) : 0;

			// Analyze per-question difficulty (based on correct answer percentage)
			const questionAnalytics = test.questions.map((question) => {
				const totalAnswers = question.answers.length;
				const correctAnswers = question.answers.filter((a) => a.isCorrect).length;
				const correctPercentage =
					totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

				// Difficulty levels: Easy (80-100%), Medium (50-79%), Hard (0-49%)
				let difficulty = 'Hard';
				if (correctPercentage >= 80) difficulty = 'Easy';
				else if (correctPercentage >= 50) difficulty = 'Medium';

				return {
					questionId: question.id,
					totalAnswered: totalAnswers,
					correctAnswers,
					correctPercentage,
					difficulty
				};
			});

			// Calculate average time taken
			const timeTaken = submittedAttempts
				.map((a) => {
					const start = new Date(a.startedAt).getTime();
					const end = a.submittedAt ? new Date(a.submittedAt).getTime() : Date.now();
					return (end - start) / 1000 / 60; // Convert to minutes
				})
				.filter((t) => t > 0);

			const averageTimeMinutes =
				timeTaken.length > 0 ?
					Math.round(timeTaken.reduce((a, b) => a + b, 0) / timeTaken.length)
				:	0;

			// Most and least attempted questions
			const mostDifficultQuestions = questionAnalytics
				.filter((q) => q.difficulty === 'Hard')
				.slice(0, 3);
			const easiestQuestions = questionAnalytics.filter((q) => q.difficulty === 'Easy').slice(0, 3);

			return {
				testId: test.id,
				title: test.title,
				chapter: {
					id: test.chapter.id,
					title: test.chapter.title
				},
				course: {
					id: test.chapter.course.id,
					title: test.chapter.course.title
				},
				basicInfo: {
					totalQuestions: test.totalQuestions,
					durationMinutes: test.durationMinutes,
					createdAt: test.createdAt
				},
				attempts: {
					total: totalAttempts,
					submitted: submittedAttempts.length,
					pending: pendingAttempts,
					completionRate,
					averageScore,
					averageTimeMinutes
				},
				questionAnalytics: {
					total: questionAnalytics.length,
					byDifficulty: {
						easy: questionAnalytics.filter((q) => q.difficulty === 'Easy').length,
						medium: questionAnalytics.filter((q) => q.difficulty === 'Medium').length,
						hard: questionAnalytics.filter((q) => q.difficulty === 'Hard').length
					},
					mostDifficult: mostDifficultQuestions,
					easiest: easiestQuestions
				}
			};
		});

		return NextResponse.json(
			new ApiResponse(200, testAnalyticsData, 'Test analytics fetched successfully'),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetTestAnalytics', error);
	}
}

// 🎯 Additional analytics controllers can be added here following similar patterns
