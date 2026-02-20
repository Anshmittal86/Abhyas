'use client';

import { UseFormReturn } from 'react-hook-form';
import { CreateQuestionFormTypes } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type Props = {
	form: UseFormReturn<CreateQuestionFormTypes>;
};

const OPTIONS = [
	{ label: 'True', value: 'True', index: 0 },
	{ label: 'False', value: 'False', index: 1 }
];

export default function TrueFalseOptionsField({ form }: Props) {
	const options = form.watch('options');

	const handleSelect = (selectedIndex: number) => {
		const updated = OPTIONS.map((opt, index) => ({
			optionText: opt.value,
			isCorrect: index === selectedIndex,
			orderIndex: index
		}));

		form.setValue('options', updated, {
			shouldValidate: true,
			shouldDirty: true
		});
	};

	return (
		<div className="space-y-4">
			<p className="text-xs font-black uppercase tracking-widest text-ab-text-secondary">
				Correct Answer
			</p>

			<div className="grid grid-cols-2 gap-4">
				{OPTIONS.map((opt, index) => {
					const selected = options?.[index]?.isCorrect === true;

					return (
						<button
							type="button"
							key={opt.value}
							onClick={() => handleSelect(index)}
							className={cn(
								'relative rounded-xl border-2 p-6 text-left transition-all',
								'hover:border-ab-primary hover:bg-ab-primary/5',
								selected ? 'border-ab-green-text bg-ab-green-bg' : 'border-ab-border bg-ab-surface'
							)}
						>
							<p
								className={cn(
									'text-lg font-black',
									selected ? 'text-ab-green-text' : 'text-ab-text-primary'
								)}
							>
								{opt.label}
							</p>

							{selected && <Check className="absolute top-3 right-3 h-5 w-5 text-ab-green-text" />}
						</button>
					);
				})}
			</div>
		</div>
	);
}
