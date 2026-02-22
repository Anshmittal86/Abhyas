import { z } from 'zod';

export const saveAttemptAnswerSchema = z.object({
	questionId: z.string().uuid('Invalid question id'),
	selectedOption: z.string().uuid('Invalid option id').optional().nullable()
});
