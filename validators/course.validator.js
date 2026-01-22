import { z } from 'zod';

export const courseSchema = z.object({
	title: z.string().min(3, 'Course title is required'),
	description: z.string().optional(),
	duration: z.string().optional(),
	isActive: z.boolean().optional()
});
