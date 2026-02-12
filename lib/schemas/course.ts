import { z } from 'zod';

export const createCourseSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(100),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
	duration: z.string().min(1, 'Duration is required')
});

export type CreateCourseForm = z.infer<typeof createCourseSchema>;
