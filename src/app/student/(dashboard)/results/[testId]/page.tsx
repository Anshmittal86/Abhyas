'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';

type ResultPayload = {
	test: {
		id: string;
		title: string;
		totalQuestions: number;
		durationMinutes: number;
		chapter: { title: string };
		course: { title: string };
	};
	statistics?: {
		totalAttempts: number;
		averageScore: number;
		bestScore: number;
		latestScore: number | null;
		latestAccuracy: number;
		timeTakenMinutes: number | null;
	};
	attempts: Array<{
		id: string;
		submittedAt: string;
		score: number | null;
		answeredQuestions: number;
		correctAnswers: number;
		accuracy: number;
	}>;
};

export default function StudentResultPage() {
	const { testId } = useParams();
	const router = useRouter();

	const [data, setData] = useState<ResultPayload | null>(null);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const fetchResult = useCallback(async () => {
		setLoading(true);
		setHasError(false);

		try {
			const response = await apiFetch(`/api/student/results/${testId}`);
			if (!response.ok) throw new Error(`API error: ${response.status}`);
			const result = await response.json();
			setData(result.data ?? null);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/student-login';
				return;
			}
			console.error('Result fetch error:', error);
			setHasError(true);
		} finally {
			setLoading(false);
		}
	}, [testId]);

	useEffect(() => {
		void fetchResult();
	}, [fetchResult]);

	if (loading) return <Loader size={35} message="Loading Result..." />;
	if (hasError) return <ErrorState onRetry={fetchResult} />;
	if (!data) return null;

	const latest = data.statistics;

	return (
		<main className="flex-1 px-8 py-6 space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-primary">Result</h1>
					<p className="text-sm text-secondary">
						{data.test.course.title} • {data.test.chapter.title} • {data.test.title}
					</p>
				</div>

				<button
					onClick={() => router.push('/student/tests')}
					className="px-4 py-2 rounded-lg border border-default hover:border-amber-600 transition"
				>
					Back to tests
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-surface border border-default rounded-xl p-4">
					<div className="text-sm text-muted">Latest score</div>
					<div className="text-2xl font-semibold text-primary">{latest?.latestScore ?? 0}%</div>
				</div>
				<div className="bg-surface border border-default rounded-xl p-4">
					<div className="text-sm text-muted">Best score</div>
					<div className="text-2xl font-semibold text-primary">{latest?.bestScore ?? 0}%</div>
				</div>
				<div className="bg-surface border border-default rounded-xl p-4">
					<div className="text-sm text-muted">Average score</div>
					<div className="text-2xl font-semibold text-primary">{latest?.averageScore ?? 0}%</div>
				</div>
				<div className="bg-surface border border-default rounded-xl p-4">
					<div className="text-sm text-muted">Attempts</div>
					<div className="text-2xl font-semibold text-primary">{latest?.totalAttempts ?? 0}</div>
				</div>
			</div>

			<div className="bg-surface border border-default rounded-xl p-5 space-y-3">
				<h2 className="text-lg font-semibold text-primary">Attempt history</h2>

				{data.attempts.length === 0 ?
					<p className="text-secondary text-sm">No submitted attempts yet.</p>
				:	<div className="space-y-2">
						{data.attempts.map((a) => (
							<div
								key={a.id}
								className="flex flex-wrap items-center justify-between gap-3 border border-default rounded-lg p-3"
							>
								<div className="text-sm text-secondary">
									Submitted: {new Date(a.submittedAt).toLocaleString()}
								</div>
								<div className="flex items-center gap-4 text-sm">
									<span className="text-primary font-medium">{a.score ?? 0}%</span>
									<span className="text-secondary">
										Correct: {a.correctAnswers}/{a.answeredQuestions}
									</span>
									<span className="text-secondary">Accuracy: {a.accuracy}%</span>
								</div>
							</div>
						))}
					</div>
				}
			</div>
		</main>
	);
}

