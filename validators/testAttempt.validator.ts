import { z } from 'zod';

export const getTestAttemptsFilterSchema = z.object({
	studentId: z.string().uuid().optional(),
	testId: z.string().uuid().optional(),
	status: z.enum(['pending', 'submitted']).optional()
});

export const deleteTestAttemptSchema = z.object({
	attemptId: z.string().uuid('Invalid attempt id')
});
