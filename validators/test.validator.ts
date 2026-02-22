import { z } from 'zod';

export const createTestSchema = z.object({
	chapterId: z.uuid('Invalid chapter id'),
	title: z.string().min(3, 'Test title is required').trim(),
	durationMinutes: z.number().int().positive('Duration must be a positive number'),
	maxQuestions: z.number().int().positive('Total questions must be a positive number')
});

export const updateTestSchema = z.object({
	title: z
		.string()
		.min(3, 'Test title must be at least 3 characters')
		.max(200, 'Test title too long')
		.trim()
});
