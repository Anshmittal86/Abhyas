'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { CreateQuestionFormTypes } from '@/types';
import { useState } from 'react';

type Props = {
	form: UseFormReturn<CreateQuestionFormTypes>;
};

export default function MCQOptionsField({ form }: Props) {
	const { fields, replace } = useFieldArray({
		control: form.control,
		name: 'options'
	});

	// ensure always 4 options exist
	const ensureFourOptions = () => {
		if (fields.length !== 4) {
			replace(
				Array.from({ length: 4 }).map((_, index) => ({
					optionText: '',
					isCorrect: index === 0,
					orderIndex: index
				}))
			);
		}
	};

	// run once on mount
	useState(() => {
		ensureFourOptions();
	});

	const handleCorrectChange = (selectedIndex: number) => {
		const newOptions = fields.map((opt, index) => ({
			...opt,
			isCorrect: index === selectedIndex
		}));

		replace(newOptions);
	};

	return (
		<div className="space-y-4">
			<p className="text-xs font-black uppercase text-ab-text-secondary">Options</p>

			{fields.map((field, index) => (
				<div key={field.id} className="flex items-center gap-3">
					<input
						type="radio"
						name="correctOption"
						checked={form.watch(`options.${index}.isCorrect`)}
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
