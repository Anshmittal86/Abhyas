import { z } from 'zod';

export const createQuestionSchema = z.object({
	testId: z.uuid('Invalid test id'),
	questionText: z.string().min(5, 'Question text is required'),

	optionA: z.string().min(1, 'Option A is required'),
	optionB: z.string().min(1, 'Option B is required'),
	optionC: z.string().min(1, 'Option C is required'),
	optionD: z.string().min(1, 'Option D is required'),

	correctOption: z.enum(['A', 'B', 'C', 'D'], {
		message: 'Correct option must be one of A, B, C, D'
	})
});

export const updateQuestionSchema = createQuestionSchema.omit({ testId: true });
