import { createChapterSchema, updateChapterSchema } from '@/validators/chapter.validator';
import z from 'zod';

export type ChaptersListTypes = {
	id: string;
	code: string;
	title: string;
	orderNo: number;
	testCount: number;
	course: {
		id: string;
		title: string;
	};
	createdAt: string;
};

export interface ChapterTypes {
	id: string;
	code: string;
	title: string;
	orderNo: number;
	createdAt: string;
	updatedAt: string;
	courseId: string;
	adminId: string;
	admin: {
		id: string;
		name: string;
		email: string;
	};
	course: {
		id: string;
		title: string;
		description: string | null;
	};
	tests: {
		id: string;
		title: string;
	}[];
}

export type CreateChapterFormTypes = z.infer<typeof createChapterSchema>;

export type UpdateChapterFormTypes = z.infer<typeof updateChapterSchema>;
