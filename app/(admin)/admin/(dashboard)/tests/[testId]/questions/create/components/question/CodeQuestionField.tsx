'use client';

import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { CreateQuestionFormTypes } from '@/types';

type Props = {
	form: UseFormReturn<CreateQuestionFormTypes>;
};

const languageOptions = [
	{ value: 'html', label: 'HTML' },
	{ value: 'css', label: 'CSS' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'python', label: 'Python' },
	{ value: 'java', label: 'Java' },
	{ value: 'cpp', label: 'C++' },
	{ value: 'c', label: 'C' },
	{ value: 'go', label: 'Go' },
	{ value: 'rust', label: 'Rust' }
];

export default function CodeQuestionField({ form }: Props) {
	return (
		<div className="space-y-5">
			<p className="text-xs font-black uppercase tracking-widest text-ab-text-secondary">
				Code Configuration
			</p>

			<FormField
				control={form.control}
				name="language"
				label="Programming Language"
				type="select"
				placeholder="Select language"
				required
				options={languageOptions}
			/>

			<FormField
				control={form.control}
				name="starterCode"
				label="Starter Code"
				type="textarea"
				placeholder={`Example:
function solution() {

}`}
				rows={8}
			/>
		</div>
	);
}
