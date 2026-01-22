import { z } from 'zod';

export const createChapterSchema = z.object({
	courseId: z.uuid('Invalid course id'),
	code: z.string().min(2, 'Chapter code is required'),
	title: z.string().min(3, 'Chapter title is required'),
	orderNo: z.number().int().positive()
});

export const updateChapterSchema = z.object({
	code: z.string().min(2, 'Chapter code is required'),
	title: z.string().min(3, 'Chapter title is required'),
	orderNo: z.number().int().positive()
});
