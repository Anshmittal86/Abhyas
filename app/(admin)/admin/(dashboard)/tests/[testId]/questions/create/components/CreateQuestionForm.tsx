'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import MCQOptionsField from './question/MCQOptionsField';
import TrueFalseOptionsField from './question/TrueFalseOptionsField';
import CodeQuestionField from './question/CodeQuestionField';

import { toast } from 'sonner';
import { CreateQuestionFormTypes, SuccessResponseTypes } from '@/types';
import { useState, useEffect } from 'react';

type Props = {
	testId: string;
	onSuccess: () => void;
};

export default function CreateQuestionForm({ testId, onSuccess }: Props) {
	const form = useForm<CreateQuestionFormTypes>({
		defaultValues: {
			testId,
			questionType: 'MCQ',
			questionText: '',
			explanation: '',
			marks: 1,
			options: [
				{ optionText: '', isCorrect: false, orderIndex: 0 },
				{ optionText: '', isCorrect: false, orderIndex: 1 },
				{ optionText: '', isCorrect: false, orderIndex: 2 },
				{ optionText: '', isCorrect: false, orderIndex: 3 }
			]
		}
	});

	const questionType = form.watch('questionType');
	const options = form.watch('options');
	const [hasCorrectAnswer, setHasCorrectAnswer] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Check if at least one correct answer is selected for MCQ and TRUE_FALSE
	useEffect(() => {
		if (questionType === 'MCQ' || questionType === 'TRUE_FALSE') {
			const hasCorrect = Array.isArray(options) && options.some((opt) => opt?.isCorrect === true);
			setHasCorrectAnswer(hasCorrect);
		} else {
			// For other types, consider it valid
			setHasCorrectAnswer(true);
		}
	}, [options, questionType]);

	const onSubmit = async (data: CreateQuestionFormTypes) => {
		// Additional frontend validation
		if ((data.questionType === 'MCQ' || data.questionType === 'TRUE_FALSE') && !hasCorrectAnswer) {
			toast.error('Please select at least one correct answer');
			return;
		}

		try {
			setIsSubmitting(true);
			const res = await fetch('/api/admin/question', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const result = (await res.json()) as SuccessResponseTypes<CreateQuestionFormTypes>;

			if (!result.success) {
				throw new Error(result.message);
			}

			toast.success('Question created');

			onSuccess();

			form.reset({
				...data,
				questionText: '',
				explanation: ''
			});
		} catch (error) {
			if (error instanceof Error) {
				toast.error(`${error.message || 'Failed to create question'}`);
				console.error('Error creating question:', error);
			} else {
				toast.error('An unknown error occurred while creating the question');
				console.error('Unknown error creating question:', error);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const isSubmitDisabled = (questionType === 'MCQ' || questionType === 'TRUE_FALSE') && !hasCorrectAnswer;

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<FormField
				control={form.control}
				name="questionType"
				label="Question Type"
				type="select"
				options={[
					{ value: 'MCQ', label: 'MCQ' },
					{ value: 'TRUE_FALSE', label: 'True False' },
					{ value: 'SHORT_ANSWER', label: 'Short Answer' },
					{ value: 'LONG_ANSWER', label: 'Long Answer' },
					{ value: 'CODE', label: 'Code' }
				]}
			/>

			<FormField control={form.control} name="questionText" label="Question" type="textarea" />

			<FormField control={form.control} name="marks" label="Marks" type="number" />

			{questionType === 'MCQ' && <MCQOptionsField form={form} />}

			{questionType === 'TRUE_FALSE' && <TrueFalseOptionsField form={form} />}

			{questionType === 'CODE' && <CodeQuestionField form={form} />}

			<Button type="submit" disabled={isSubmitDisabled || isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Question'}
			</Button>
		</form>
	);
}
