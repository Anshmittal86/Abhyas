'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTestQuestionProgress } from '@/lib/api';
import CreateQuestionForm from './CreateQuestionForm';
import { Loader2 } from 'lucide-react';
import { TestQuestionProgress } from '@/types/tests';

type Props = {
	testId: string;
};

export default function CreateQuestionPageClient({ testId }: Props) {
	const [progress, setProgress] = useState<TestQuestionProgress | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// reusable loader function
	const loadProgress = useCallback(async () => {
		try {
			setRefreshing(true);

			const data = await getTestQuestionProgress(testId);

			setProgress(data);
		} catch (error) {
			console.error('Error loading question progress:', error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [testId]);

	// initial load
	useEffect(() => {
		loadProgress();
	}, [loadProgress]);

	// called after question creation
	const handleQuestionCreated = async () => {
		await loadProgress();
	};

	if (loading || !progress) {
		return (
			<div className="flex justify-center items-center h-40">Loading question progress...</div>
		);
	}

	const {
		title,
		maxQuestions,
		questionCount,
		progressPercentage,
		remainingQuestions,
		isCompleted
	} = progress;

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h2 className="text-2xl font-semibold">
							Questions Created: {questionCount} / {maxQuestions}
						</h2>
						<p className="text-sm text-muted-foreground">
							You have created {questionCount} questions out of {maxQuestions} maximum for this
							test.
						</p>
					</div>

					<div className="text-right">
						<div className="flex items-center gap-2 justify-end">
							<div className="text-sm font-medium">{progressPercentage}%</div>
							{refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
						</div>
					</div>
				</div>

				<div className="mt-4">
					<div className="h-3 bg-slate-100 rounded-full overflow-hidden">
						<div className="h-full bg-blue-600" style={{ width: `${progressPercentage}%` }} />
					</div>
				</div>
				<div className="mt-3 flex justify-between text-sm text-muted-foreground">
					<span>{title}</span>
					<span>Remaining: {remainingQuestions}</span>
				</div>
			</div>

			{!isCompleted && (
				<div className="p-6 bg-white border border-slate-200 rounded-lg">
					<div className="mb-4">
						<h3 className="text-lg font-medium">Select Question Type:</h3>
					</div>

					<CreateQuestionForm testId={testId} onSuccess={handleQuestionCreated} />
				</div>
			)}

			{isCompleted && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold">
					All questions have been created successfully.
				</div>
			)}
		</div>
	);
}
