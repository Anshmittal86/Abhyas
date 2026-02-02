'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface Question {
	id: string;
	text: string;
	options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
	selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
}

type Props = {
	attemptId: string;
	question: Question;
};

export default function OptionsList({ attemptId, question }: Props) {
	const [submitting, setSubmitting] = useState(false);
	const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(
		question.selectedOption ?? null
	);

	// When question changes, reset local selection from server value (or clear it)
	// so that a new question never reuses the previous selection.
	useEffect(() => {
		setSelected(question.selectedOption ?? null);
	}, [question.id, question.selectedOption]);

	const handleSelect = async (choice: 'A' | 'B' | 'C' | 'D') => {
		if (submitting) return;

		setSelected(choice);
		setSubmitting(true);

		try {
			const res = await apiFetch(`/api/student/attempt/${attemptId}/answer`, {
				method: 'POST',
				body: JSON.stringify({
					questionId: question.id,
					selectedOption: choice
				})
			});

			if (!res.ok) throw new Error();

		} catch (err) {
			console.error('Answer submit failed: ', err);
			setSelected(null);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-3">
			{question.options.map(({ key, text }) => {
				const active = selected === key;

				return (
					<button
						key={key}
						onClick={() => handleSelect(key)}
						disabled={submitting}
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition
							${active ? 'border-amber-600 bg-amber-50 text-black font-medium' : 'border-default text-primary'}
							${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:border-amber-600 cursor-pointer'}
						`}
					>
						<span
							className={`w-4 h-4 rounded-full border ${
								active ? 'border-amber-600 bg-amber-600' : 'border-default'
							}`}
						/>
						<span>
							<strong>{key}.</strong> {text}
						</span>
					</button>
				);
			})}
		</div>
	);
}
