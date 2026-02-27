import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { logEvent } from '@/utils/log-event';
import { requireRole } from '@/utils/auth-guard';

import {
	bulkUploadSchema,
	createQuestionSchema,
	updateQuestionSchema
} from '@/validators/question.validator';
import { asyncHandler, asyncHandlerWithContext } from '@/utils/async-handler';

export const createTestQuestion = asyncHandler('CreateTestQuestion', async (request) => {
	// 🔐 Admin id from middleware
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);
	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 📦 Validate request body
	const body = await request.json();

	const parsedBody = createQuestionSchema.parse(body);

	const { testId, questionText, questionType, explanation, marks } = parsedBody;

	const options = 'options' in parsedBody ? parsedBody.options : undefined;

	// ✅ Check test exists & belongs to admin
	const test = await prisma.test.findFirst({
		where: { id: testId, adminId }
	});

	if (!test) {
		throw new ApiError(404, 'Test not found or access denied');
	}

	// 🔒 Transaction: create question + options atomically

	const result = await prisma.$transaction(async (tx) => {
		const question = await tx.question.create({
			data: {
				testId,
				adminId,
				questionType,
				questionText,
				marks,
				...(explanation !== undefined && { explanation })
			}
		});

		if (options && options.length > 0) {
			await tx.questionOption.createMany({
				data: options.map((opt) => ({
					questionId: question.id,
					optionText: opt.optionText,
					isCorrect: opt.isCorrect,
					orderIndex: opt.orderIndex
				}))
			});
		}

		// Increment totalMarks
		await tx.test.update({
			where: { id: testId },
			data: {
				totalMarks: {
					increment: marks
				}
			}
		});

		return question;
	});

	// 🧾 Audit log
	logEvent('QuestionCreated', {
		adminId,
		testId,
		questionId: result.id,
		questionType
	});

	return NextResponse.json(
		new ApiResponse(201, result, `${questionType} question created successfully`),
		{
			status: 201
		}
	);
});

export const getTestQuestions = asyncHandler('GetTestQuestions', async (request) => {
	// 🔐 Auth guard
	const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

	if (!adminId || role !== 'admin') {
		throw new ApiError(401, 'Unauthorized access');
	}

	// 📋 Fetch questions with options
	const questions = await prisma.question.findMany({
		where: {
			adminId
		},
		include: {
			options: {
				select: {
					id: true,
					optionText: true,
					isCorrect: true,
					orderIndex: true
				},
				orderBy: {
					orderIndex: 'asc'
				}
			},
			test: {
				select: {
					id: true,
					title: true
				}
			},
			_count: {
				select: {
					answers: true
				}
			}
		},
		orderBy: {
			createdAt: 'asc'
		}
	});

	// 📊 Format response
	const formattedQuestions = questions.map((question) => ({
		id: question.id,
		questionText: question.questionText,
		questionType: question.questionType,
		explanation: question.explanation,
		marks: question.marks,

		options: question.options,

		test: {
			id: question.test.id,
			title: question.test.title
		},

		answerCount: question._count.answers,

		createdAt: question.createdAt,
		updatedAt: question.updatedAt
	}));

	return NextResponse.json(
		new ApiResponse(200, formattedQuestions, 'Questions fetched successfully'),
		{
			status: 200
		}
	);
});

export const getTestQuestionById = asyncHandlerWithContext(
	'GetTestQuestionById',
	async (request, context) => {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { questionId } = await context.params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		const question = await prisma.question.findFirst({
			where: {
				id: questionId,
				adminId
			},
			include: {
				options: {
					select: {
						id: true,
						optionText: true,
						isCorrect: true,
						orderIndex: true
					},
					orderBy: {
						orderIndex: 'asc'
					}
				},
				test: {
					select: {
						id: true,
						title: true,
						chapter: {
							select: {
								id: true,
								title: true,
								code: true
							}
						}
					}
				},
				answers: {
					select: {
						id: true,
						textAnswer: true,
						codeAnswer: true,
						isCorrect: true,
						marksAwarded: true,
						answeredAt: true,
						selectedOption: {
							select: {
								id: true,
								optionText: true,
								isCorrect: true
							}
						},
						attempt: {
							select: {
								id: true,
								student: {
									select: {
										id: true,
										name: true,
										provisionalNo: true
									}
								}
							}
						}
					}
				}
			}
		});

		if (!question) {
			throw new ApiError(404, 'Question not found');
		}

		const formattedQuestion = {
			id: question.id,
			questionText: question.questionText,
			questionType: question.questionType,
			explanation: question.explanation,
			marks: question.marks,

			options: question.options,

			test: {
				id: question.test.id,
				title: question.test.title,
				chapter: question.test.chapter
			},

			answers: question.answers.map((answer) => ({
				id: answer.id,
				selectedOption: answer.selectedOption,
				textAnswer: answer.textAnswer,
				codeAnswer: answer.codeAnswer,
				isCorrect: answer.isCorrect,
				marksAwarded: answer.marksAwarded,
				answeredAt: answer.answeredAt,
				student: answer.attempt.student
			})),

			createdAt: question.createdAt,
			updatedAt: question.updatedAt
		};

		return NextResponse.json(
			new ApiResponse(200, formattedQuestion, 'Question fetched successfully'),
			{
				status: 200
			}
		);
	}
);

export const updateTestQuestion = asyncHandlerWithContext(
	'UpdateTestQuestion',
	async (request, context) => {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { questionId } = await context.params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		// ✅ check ownership
		const existingQuestion = await prisma.question.findFirst({
			where: {
				id: questionId,
				adminId
			}
		});

		if (!existingQuestion) {
			throw new ApiError(404, 'Question not found or access denied');
		}

		// 📦 Validate request body
		const body = await request.json();
		const parsedData = updateQuestionSchema.parse(body);

		const { questionText, questionType, explanation, marks } = parsedData;

		const options = 'options' in parsedData ? parsedData.options : undefined;

		const hasOptionsField = Object.prototype.hasOwnProperty.call(body, 'options');

		if (hasOptionsField) {
			// options field present but invalid after parsing
			if (!options) {
				throw new ApiError(400, 'Invalid options format');
			}

			const effectiveType = questionType ?? existingQuestion.questionType;

			if (effectiveType === 'MCQ' && options.length < 2) {
				throw new ApiError(400, 'MCQ question must have at least 2 options');
			}

			if (effectiveType === 'TRUE_FALSE' && options.length !== 2) {
				throw new ApiError(400, 'TRUE_FALSE question must have exactly 2 options');
			}
		}

		// transaction update
		const updatedQuestion = await prisma.$transaction(async (tx) => {
			const oldMarks = existingQuestion.marks ?? 0;

			// update question
			const question = await tx.question.update({
				where: {
					id: questionId
				},
				data: {
					questionText,
					questionType,
					marks,
					...(explanation !== undefined && { explanation })
				}
			});

			if (marks !== undefined && marks !== oldMarks) {
				const diff = marks - oldMarks;

				await tx.test.update({
					where: { id: existingQuestion.testId },
					data: {
						totalMarks: {
							increment: diff
						}
					}
				});
			}

			// update options if provided
			if (options) {
				// delete old options
				await tx.questionOption.deleteMany({
					where: {
						questionId
					}
				});

				// insert new options
				if (options.length > 0) {
					await tx.questionOption.createMany({
						data: options.map((opt) => ({
							questionId,
							optionText: opt.optionText,
							isCorrect: opt.isCorrect,
							orderIndex: opt.orderIndex
						}))
					});
				}
			}

			return question;
		});

		// 🧾 Audit log
		logEvent('QuestionUpdated', {
			adminId,
			questionId: updatedQuestion.id,
			testId: updatedQuestion.testId,
			questionType: updatedQuestion.questionType
		});

		return NextResponse.json(
			new ApiResponse(200, updatedQuestion, 'Question updated successfully'),
			{
				status: 200
			}
		);
	}
);

export const deleteTestQuestion = asyncHandlerWithContext(
	'DeleteTestQuestion',
	async (request, context) => {
		// 🔐 Auth guard
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { questionId } = await context.params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		// ✅ verify ownership and fetch minimal data
		const existingQuestion = await prisma.question.findFirst({
			where: {
				id: questionId,
				adminId
			},
			select: {
				id: true,
				testId: true,
				questionType: true,
				marks: true,
				_count: {
					select: {
						answers: true
					}
				}
			}
		});

		if (!existingQuestion) {
			throw new ApiError(404, 'Question not found or access denied');
		}

		// optional safety rule (recommended)
		// prevent deletion if students already attempted it
		if (existingQuestion._count.answers > 0) {
			throw new ApiError(400, 'Cannot delete question that has student attempts');
		}

		// 🗑️ delete question (cascade deletes options and answers automatically)
		await prisma.$transaction(async (tx) => {
			await tx.question.delete({
				where: { id: questionId }
			});

			await tx.test.update({
				where: { id: existingQuestion.testId },
				data: {
					totalMarks: {
						decrement: existingQuestion.marks
					}
				}
			});
		});

		// 🧾 audit log
		logEvent('QuestionDeleted', {
			adminId,
			questionId: existingQuestion.id,
			testId: existingQuestion.testId,
			questionType: existingQuestion.questionType
		});

		return NextResponse.json(new ApiResponse(200, null, 'Question deleted successfully'), {
			status: 200
		});
	}
);

export const uploadBulkQuestion = asyncHandler('BulkUploadQuestions', async (request) => {
	const { userId } = requireRole(request, ['admin']);

	if (!userId) {
		throw new ApiError(401, 'Unauthorized access');
	}

	const body = await request.json();
	const parsed = bulkUploadSchema.safeParse(body);

	if (!parsed.success) {
		throw new ApiError(400, parsed.error.errors[0].message);
	}

	const { testId, questions } = parsed.data;

	if (!testId || !Array.isArray(questions)) {
		throw new ApiError(400, 'Invalid request body');
	}

	const test = await prisma.test.findFirst({
		where: {
			id: testId,
			adminId: userId
		},
		select: {
			id: true,
			maxQuestions: true
		}
	});

	if (!test) {
		throw new ApiError(404, 'Test not found or access denied');
	}

	const existingCount = await prisma.question.count({
		where: { testId }
	});

	const newTotal = existingCount + questions.length;

	if (newTotal > test.maxQuestions) {
		throw new ApiError(
			400,
			`Question limit exceeded. Allowed: ${test.maxQuestions}, Existing: ${existingCount}`
		);
	}

	await prisma.$transaction(async (tx) => {
		let totalAddedMarks = 0;
		for (const q of questions) {
			totalAddedMarks += q.marks;
			const createdQuestion = await tx.question.create({
				data: {
					testId,
					adminId: userId,
					questionText: q.questionText,
					questionType: q.questionType,
					explanation: q.explanation,
					difficulty: q.difficulty,
					marks: q.marks
				}
			});

			if ('options' in q && q.options) {
				await tx.questionOption.createMany({
					data: q.options.map((opt) => ({
						questionId: createdQuestion.id,
						optionText: opt.optionText,
						isCorrect: opt.isCorrect,
						orderIndex: opt.orderIndex
					}))
				});
			}
		}

		// update total marks
		await tx.test.update({
			where: { id: testId },
			data: {
				totalMarks: {
					increment: totalAddedMarks
				}
			}
		});
	});

	return NextResponse.json(
		new ApiResponse(
			200,
			{
				inserted: questions.length,
				totalNow: newTotal,
				remaining: test.maxQuestions - newTotal
			},
			'Questions uploaded successfully'
		)
	);
});
