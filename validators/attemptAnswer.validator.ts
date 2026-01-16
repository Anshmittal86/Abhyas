import { z } from 'zod';

export const saveAttemptAnswerSchema = z.object({
	questionId: z.uuid('Invalid question id'),
	selectedOption: z.enum(['A', 'B', 'C', 'D']).optional().nullable()
});
