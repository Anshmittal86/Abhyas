import { z } from 'zod';

const baseQuestionCoreSchema = z.object({
	questionText: z.string().min(5, 'Question text is required'),
	questionType: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'CODE']),
	explanation: z.string().optional(),
	difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
	marks: z.coerce.number().int().min(1).max(20).default(1)
});

const baseQuestionSchema = baseQuestionCoreSchema.extend({
	testId: z.uuid('Invalid test id')
});

const optionSchema = z.object({
	optionText: z.string().min(1, 'Option text is required'),
	isCorrect: z.boolean(),
	orderIndex: z.number().int()
});

const baseUpdateQuestionSchema = z.object({
	questionText: z.string().min(5).optional(),
	questionType: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'CODE']).optional(),
	explanation: z.string().optional(),
	marks: z.coerce.number().int().min(1).max(20).optional()
});

const mcqSchema = baseQuestionSchema.extend({
	questionType: z.literal('MCQ'),
	options: z
		.array(
			z.object({
				optionText: z.string().min(1, 'Option text is required'),
				isCorrect: z.boolean(),
				orderIndex: z.number().int()
			})
		)
		.min(2, 'At least 2 options required')
		.max(6, 'Maximum 6 options allowed')
		.refine(
			(options) => options.some((opt) => opt.isCorrect === true),
			'At least one option must be marked as correct'
		)
});

const updateMcqSchema = baseUpdateQuestionSchema.extend({
	questionType: z.literal('MCQ').optional(),
	options: z
		.array(optionSchema)
		.min(2)
		.max(6)
		.optional()
		.refine(
			(options) => !options || options.some((opt) => opt.isCorrect === true),
			'At least one option must be marked as correct'
		)
});

const trueFalseSchema = baseQuestionSchema.extend({
	questionType: z.literal('TRUE_FALSE'),
	options: z
		.array(
			z.object({
				optionText: z.enum(['True', 'False']),
				isCorrect: z.boolean(),
				orderIndex: z.number().int()
			})
		)
		.length(2, 'True/False must have exactly 2 options')
		.refine(
			(options) => options.some((opt) => opt.isCorrect === true),
			'Either True or False must be marked as correct'
		)
});

const updateTrueFalseSchema = baseUpdateQuestionSchema.extend({
	questionType: z.literal('TRUE_FALSE').optional(),
	options: z
		.array(optionSchema)
		.length(2)
		.optional()
		.refine(
			(options) => !options || options.some((opt) => opt.isCorrect === true),
			'Either True or False must be marked as correct'
		)
});

const descriptiveSchema = baseQuestionSchema.extend({
	questionType: z.enum(['SHORT_ANSWER', 'LONG_ANSWER'])
});

const updateDescriptiveSchema = baseUpdateQuestionSchema.extend({
	questionType: z.enum(['SHORT_ANSWER', 'LONG_ANSWER']).optional()
});

const codeSchema = baseQuestionSchema.extend({
	questionType: z.literal('CODE'),
	starterCode: z.string().optional(),
	language: z.string().optional()
});

const updateCodeSchema = baseUpdateQuestionSchema.extend({
	questionType: z.literal('CODE').optional(),
	starterCode: z.string().optional(),
	language: z.string().optional()
});

export const createQuestionSchema = z.discriminatedUnion('questionType', [
	mcqSchema,
	trueFalseSchema,
	descriptiveSchema,
	codeSchema
]);

const bulkMcqSchema = mcqSchema.omit({ testId: true });
const bulkTrueFalseSchema = trueFalseSchema.omit({ testId: true });
const bulkDescriptiveSchema = descriptiveSchema.omit({ testId: true });
const bulkCodeSchema = codeSchema.omit({ testId: true });

const bulkQuestionSchema = z.discriminatedUnion('questionType', [
	bulkMcqSchema,
	bulkTrueFalseSchema,
	bulkDescriptiveSchema,
	bulkCodeSchema
]);

export const updateQuestionSchema = z.union([
	updateMcqSchema,
	updateTrueFalseSchema,
	updateDescriptiveSchema,
	updateCodeSchema
]);

export const bulkUploadSchema = z.object({
	testId: z.uuid('Invalid test id'),
	questions: z.array(bulkQuestionSchema).min(1, 'At least one question required')
});
