'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { CreateQuestionFormTypes } from '@/types';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

type Props = {
	form: UseFormReturn<CreateQuestionFormTypes>;
};

export default function MCQOptionsField({ form }: Props) {
	const { fields, replace, update } = useFieldArray({
		control: form.control,
		name: 'options'
	});
	const [hasCorrectAnswer, setHasCorrectAnswer] = useState(false);

	// ensure options exist ONLY once
	useEffect(() => {
		if (!fields || fields.length === 0) {
			replace(
				Array.from({ length: 4 }).map((_, index) => ({
					optionText: '',
					isCorrect: index === 0,
					orderIndex: index
				}))
			);
		}
	}, []); // important: empty dependency

	// Check if at least one correct answer is selected
	useEffect(() => {
		const options = form.watch('options');
		const hasCorrect = Array.isArray(options) && options.some((opt) => opt?.isCorrect === true);
		setHasCorrectAnswer(hasCorrect);
	}, [form.watch('options'), form]);

	const handleCorrectChange = (selectedIndex: number) => {
		fields.forEach((field, index) => {
			update(index, {
				optionText: form.getValues(`options.${index}.optionText`), // preserve text
				isCorrect: index === selectedIndex,
				orderIndex: index
			});
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-xs font-black uppercase text-ab-text-secondary">Options</p>
				{!hasCorrectAnswer && (
					<div className="flex items-center gap-1.5 text-xs text-red-500">
						<AlertCircle className="h-3.5 w-3.5" />
						<span>At least one correct answer required</span>
					</div>
				)}
			</div>

			{fields.map((field, index) => (
				<div key={field.id} className="flex items-center gap-3">
					<input
						type="radio"
						value={index}
						checked={field.isCorrect === true}
						onChange={() => handleCorrectChange(index)}
						className="h-4 w-4 cursor-pointer"
					/>

					<div className="flex-1">
						<FormField
							control={form.control}
							name={`options.${index}.optionText`}
							label={`Option ${index + 1}`}
							type="text"
							placeholder={`Enter option ${index + 1}`}
							required
						/>
					</div>
				</div>
			))}
		</div>
	);
}
