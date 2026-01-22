import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';

import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';
import { requireRole } from '@/utils/auth-guard';

import { createQuestionSchema, updateQuestionSchema } from '@/validators/question.validator';

export async function createQuestion(request: NextRequest) {
	try {
		// 🔐 Admin id from middleware
		const adminId = request.headers.get('x-user-id');
		if (!adminId) {
			throw new ApiError(401, 'Unauthorized');
		}

		// 📦 Validate request body
		const body = await request.json();
		const { testId, questionText, optionA, optionB, optionC, optionD, correctOption } =
			createQuestionSchema.parse(body);

		// ✅ Check test exists & belongs to admin
		const test = await prisma.test.findFirst({
			where: { id: testId, adminId }
		});

		if (!test) {
			throw new ApiError(404, 'Test not found or access denied');
		}

		// 🧠 Create question
		const question = await prisma.question.create({
			data: {
				testId,
				adminId,
				questionText,
				optionA,
				optionB,
				optionC,
				optionD,
				correctOption // Prisma enum OptionChoice will accept "A" | "B" | "C" | "D"
			}
		});

		// 🧾 Audit log
		logEvent('QuestionCreated', {
			adminId,
			testId,
			questionId: question.id
		});

		return NextResponse.json(new ApiResponse(201, question, 'Question created successfully'), {
			status: 201
		});
	} catch (error) {
		return handleError('CreateQuestion', error);
	}
}

export async function getQuestions(request: NextRequest) {
	try {
		// 🔐 Admin ID Should Come from Middleware
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📋 Fetch all questions
		const questions = await prisma.question.findMany({
			select: {
				id: true,
				questionText: true,
				optionA: true,
				optionB: true,
				optionC: true,
				optionD: true,
				correctOption: true,
				createdAt: true,
				updatedAt: true,
				testId: true,
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
				createdAt: 'desc'
			}
		});

		// 📊 Format response with answer count
		const formattedQuestions = questions.map((question) => ({
			id: question.id,
			questionText: question.questionText,
			optionA: question.optionA,
			optionB: question.optionB,
			optionC: question.optionC,
			optionD: question.optionD,
			correctOption: question.correctOption,
			testId: question.testId,
			testTitle: question.test?.title,
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
	} catch (error) {
		return handleError('GetQuestions', error);
	}
}

export async function getQuestionById(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { id: questionId } = await params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		const question = await prisma.question.findUnique({
			where: {
				id: questionId
			},
			select: {
				id: true,
				questionText: true,
				optionA: true,
				optionB: true,
				optionC: true,
				optionD: true,
				correctOption: true,
				createdAt: true,
				updatedAt: true,
				testId: true,
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
						selectedOption: true,
						isCorrect: true,
						answeredAt: true,
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

		return NextResponse.json(new ApiResponse(200, question, 'Question fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetQuestionById', error);
	}
}

export async function updateQuestion(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { id: questionId } = await params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		// ✅ Check question exists & belongs to admin
		const question = await prisma.question.findFirst({
			where: {
				id: questionId,
				adminId
			}
		});

		if (!question) {
			throw new ApiError(404, 'Question not found or access denied');
		}

		// 📦 Validate request body
		const body = await request.json();
		const { questionText, optionA, optionB, optionC, optionD, correctOption } =
			updateQuestionSchema.parse(body);

		// 🧠 Update question
		const updatedQuestion = await prisma.question.update({
			where: {
				id: questionId
			},
			data: {
				questionText,
				optionA,
				optionB,
				optionC,
				optionD,
				correctOption
			}
		});

		// 🧾 Audit log
		logEvent('QuestionUpdated', {
			adminId,
			questionId: updatedQuestion.id,
			testId: updatedQuestion.testId
		});

		return NextResponse.json(
			new ApiResponse(200, updatedQuestion, 'Question updated successfully'),
			{
				status: 200
			}
		);
	} catch (error) {
		return handleError('UpdateQuestion', error);
	}
}

export async function deleteQuestion(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { id: questionId } = await params;

		if (!questionId) {
			throw new ApiError(400, 'Question ID is required');
		}

		// ✅ Check question exists & belongs to admin
		const question = await prisma.question.findFirst({
			where: {
				id: questionId,
				adminId
			}
		});

		if (!question) {
			throw new ApiError(404, 'Question not found or access denied');
		}

		// 🗑️ Delete question (cascades to AttemptAnswers)
		await prisma.question.delete({
			where: {
				id: questionId
			}
		});

		// 🧾 Audit log
		logEvent('QuestionDeleted', {
			adminId,
			questionId: question.id,
			testId: question.testId
		});

		return NextResponse.json(new ApiResponse(200, null, 'Question deleted successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('DeleteQuestion', error);
	}
}
