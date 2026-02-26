'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTestQuestionProgress } from '@/lib/api';
import CreateQuestionForm from './CreateQuestionForm';
import { Loader2 } from 'lucide-react';
import { TestQuestionProgress } from '@/types/tests';
import Loader from '@/components/common/Loader';

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
		return <Loader message="Loading" />;
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
		<div className="max-w-5xl mx-auto px-8 space-y-6 text-ab-text-primary">
			{/* Progress Card */}
			<div className="p-6 bg-ab-surface border border-ab-border rounded-lg shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h2 className="text-2xl font-black text-ab-text-primary">
							Questions Created: {questionCount} / {maxQuestions}
						</h2>

						<p className="text-sm text-ab-text-secondary">
							You have created {questionCount} questions out of {maxQuestions} maximum for this
							test.
						</p>
					</div>

					<div className="text-right">
						<div className="flex items-center gap-2 justify-end">
							<div className="text-sm font-semibold text-ab-text-primary">
								{progressPercentage}%
							</div>

							{refreshing && <Loader2 className="h-4 w-4 animate-spin text-ab-text-secondary" />}
						</div>
					</div>
				</div>

				{/* Progress bar */}
				<div className="mt-4">
					<div className="h-3 bg-ab-border/40 rounded-full overflow-hidden">
						<div
							className="h-full bg-ab-primary transition-all duration-500"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				<div className="mt-3 flex justify-between text-sm text-ab-text-secondary">
					<span>{title}</span>
					<span>Remaining: {remainingQuestions}</span>
				</div>
			</div>

			{/* Form Section */}
			{!isCompleted && (
				<div className="p-6 bg-ab-surface border border-ab-border rounded-lg">
					<div className="mb-4">
						<h3 className="text-lg font-semibold text-ab-text-primary">Select Question Type:</h3>
					</div>

					<CreateQuestionForm testId={testId} onSuccess={handleQuestionCreated} />
				</div>
			)}

			{/* Completed State */}
			{isCompleted && (
				<div className="p-4 bg-ab-green-bg border border-ab-green-text rounded-lg text-ab-green-text font-semibold">
					All questions have been created successfully.
				</div>
			)}
		</div>
	);
}
