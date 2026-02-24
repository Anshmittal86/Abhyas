import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireRole } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { asyncHandler, asyncHandlerWithContext } from '@/utils/async-handler';

/**
 * Get all test results for the logged-in student
 */
export const getStudentAllResults = asyncHandler('GetAllStudentResults', async (request) => {
	// 🔐 Auth - Student only
	const { userId: studentId, userRole: role } = requireRole(request, ['student']);

	if (!studentId || role !== 'student') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 📋 Fetch all submitted test attempts for the student
	const testAttempts = await prisma.testAttempt.findMany({
		where: {
			studentId,
			submittedAt: { not: null },
			status: 'COMPLETED'
		},
		select: {
			id: true,
			testId: true,
			startedAt: true,
			submittedAt: true,
			score: true,
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
			submittedAt: 'desc'
		}
	});

	// 📊 Calculate overall statistics
	const totalScore = testAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
	const averageScore = testAttempts.length > 0 ? Math.round(totalScore / testAttempts.length) : 0;

	// 📈 Format results by course
	const resultsByCourse = await prisma.enrollment.findMany({
		where: { studentId },
		select: {
			courseId: true,
			course: {
				select: {
					id: true,
					title: true
				}
			}
		}
	});

	// 🔗 Map attempts to courses
	const courseResults = resultsByCourse.map((enrollment) => {
		const courseAttempts = testAttempts.filter(
			(a) => a.test.chapter.course.id === enrollment.courseId
		);
		const courseScore = courseAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
		const courseAverage =
			courseAttempts.length > 0 ? Math.round(courseScore / courseAttempts.length) : 0;

		return {
			courseId: enrollment.course.id,
			courseTitle: enrollment.course.title,
			totalTests: courseAttempts.length,
			averageScore: courseAverage,
			attempts: courseAttempts.map((a) => ({
				id: a.id,
				testId: a.testId,
				testTitle: a.test.title,
				chapterTitle: a.test.chapter.title,
				startedAt: a.startedAt,
				submittedAt: a.submittedAt,
				score: a.score,
				maxQuestions: a.test.maxQuestions,
				answeredQuestions: a._count.answers,
				accuracy:
					a._count.answers > 0 ?
						Math.round(
							(a.answers.filter((ans) => ans.isCorrect === true).length / a._count.answers) * 100
						)
					:	0
			}))
		};
	});

	return NextResponse.json(
		new ApiResponse(
			200,
			{
				summary: {
					totalResults: testAttempts.length,
					averageScore,
					totalScore
				},
				courseResults,
				allResults: testAttempts.map((a) => ({
					id: a.id,
					testId: a.testId,
					testTitle: a.test.title,
					courseName: a.test.chapter.course.title,
					chapterName: a.test.chapter.title,
					startedAt: a.startedAt,
					submittedAt: a.submittedAt,
					score: a.score,
					maxQuestions: a.test.maxQuestions,
					answeredQuestions: a._count.answers,
					accuracy:
						a._count.answers > 0 ?
							Math.round(
								(a.answers.filter((ans) => ans.isCorrect === true).length / a._count.answers) * 100
							)
						:	0
				}))
			},
			'Test results fetched successfully'
		),
		{ status: 200 }
	);
});

/**
 * Get specific test result for a test
 */
export const getStudentResultByTestId = asyncHandlerWithContext(
	'GetStudentResultByTestId',
	async (request, context) => {
		// 🔐 Auth - Student only
		const { userId: studentId } = requireRole(request, ['student']);

		if (!studentId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { testId } = await context.params;

		if (!testId) {
			throw new ApiError(400, 'Test ID is required');
		}

		// ✅ Verify test exists and student has access (via enrollment)
		const test = await prisma.test.findUnique({
			where: { id: testId },
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
		});

		if (!test) {
			throw new ApiError(404, 'Test not found');
		}

		// ✅ Verify student is enrolled in the course
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId: test.chapter.course.id
				}
			}
		});

		if (!enrollment) {
			throw new ApiError(403, 'Not enrolled in this course');
		}

		// 📋 Fetch all submitted attempts for this test
		const attempts = await prisma.testAttempt.findMany({
			where: {
				studentId,
				testId,
				submittedAt: { not: null },
				status: 'COMPLETED'
			},
			select: {
				id: true,
				startedAt: true,
				submittedAt: true,
				score: true,
				_count: {
					select: {
						answers: true
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
			},
			orderBy: {
				submittedAt: 'desc'
			}
		});

		if (attempts.length === 0) {
			return NextResponse.json(
				new ApiResponse(
					200,
					{
						test: {
							id: test.id,
							title: test.title,
							maxQuestions: test.maxQuestions,
							durationMinutes: test.durationMinutes,
							chapter: test.chapter,
							course: test.chapter.course
						},
						attempts: [],
						message: 'No submitted attempts found for this test'
					},
					'No results found for this test'
				),
				{ status: 200 }
			);
		}

		// 📊 Calculate statistics
		const latestAttempt = attempts[0];
		const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
		const averageScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;
		const bestScore = Math.max(...attempts.map((a) => a.score || 0));
		const correctAnswers = latestAttempt.answers.filter((a) => a.isCorrect === true).length;
		const timeTakenMinutes =
			latestAttempt.submittedAt ?
				Math.ceil(
					(new Date(latestAttempt.submittedAt).getTime() -
						new Date(latestAttempt.startedAt).getTime()) /
						(1000 * 60)
				)
			:	null;

		return NextResponse.json(
			new ApiResponse(
				200,
				{
					test: {
						id: test.id,
						title: test.title,
						maxQuestions: test.maxQuestions,
						durationMinutes: test.durationMinutes,
						chapter: test.chapter,
						course: test.chapter.course
					},
					statistics: {
						totalAttempts: attempts.length,
						averageScore,
						bestScore,
						latestScore: latestAttempt.score,
						latestAccuracy:
							latestAttempt._count.answers > 0 ?
								Math.round((correctAnswers / latestAttempt._count.answers) * 100)
							:	0,
						timeTakenMinutes
					},
					attempts: attempts.map((attempt) => ({
						id: attempt.id,
						startedAt: attempt.startedAt,
						submittedAt: attempt.submittedAt,
						score: attempt.score,
						answeredQuestions: attempt._count.answers,
						correctAnswers: attempt.answers.filter((a) => a.isCorrect === true).length,
						accuracy:
							attempt._count.answers > 0 ?
								Math.round(
									(attempt.answers.filter((a) => a.isCorrect === true).length /
										attempt._count.answers) *
										100
								)
							:	0,
						answers: attempt.answers.map((answer) => ({
							questionId: answer.questionId,
							questionText: answer.question.questionText,
							questionType: answer.question.questionType,
							options: answer.question.options.map((opt) => ({
								id: opt.id,
								text: opt.optionText,
								isCorrect: opt.isCorrect,
								orderIndex: opt.orderIndex
							})),
							selectedOptionId: answer.selectedOptionId,
							isCorrect: answer.isCorrect,
							answeredAt: answer.answeredAt
						}))
					}))
				},
				'Test result fetched successfully'
			),
			{ status: 200 }
		);
	}
);
