import { createTestSchema, updateTestSchema } from '@/validators/test.validator';
import z from 'zod';

export interface TestsListTypes {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	questionCount: number;
	attemptCount: number;
	chapter: {
		id: string;
		code: string;
		title: string;
		course: {
			id: string;
			title: string;
		};
	};
	createdAt: string;
}

export interface TestDetailsTypes {
	id: string;
	title: string;
	durationMinutes: number;
	maxQuestions: number;
	questionCount: number;
	attemptCount: number;
	createdAt: string;
	updatedAt: string;

	admin: TestAdminTypes;
	chapter: TestChapterTypes;
	questions: TestQuestionPreviewTypes[];
}

interface TestAdminTypes {
	id: string;
	name: string;
	email: string;
}

interface TestChapterTypes {
	id: string;
	code: string;
	title: string;
	course: TestCourseTypes;
}

interface TestCourseTypes {
	id: string;
	title: string;
	description: string;
	duration: string;
	isActive: boolean;
}

interface TestQuestionPreviewTypes {
	id: string;
	questionText: string;
	questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
}

export type CreateTestType = z.infer<typeof createTestSchema>;
export type UpdateTestType = z.infer<typeof updateTestSchema>;
