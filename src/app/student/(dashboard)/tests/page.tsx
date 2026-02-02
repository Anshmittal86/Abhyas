'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';

interface Test {
	id: string;
	title: string;
	chapterName: string;
	totalQuestions: number;
	durationMinutes: number;
}

export default function AvailableTestsPage() {
	const router = useRouter();

	const [tests, setTests] = useState<Test[]>([]);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const fetchTests = useCallback(async () => {
		setLoading(true);
		setHasError(false);

		try {
			const response = await apiFetch('/api/student/tests', {
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const result = await response.json();
			setTests(result.data || []);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/student-login';
				return;
			}
			console.error('Available tests error:', error);
			setHasError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTests();
	}, [fetchTests]);

	const handleStartTest = async (testId: string) => {
		router.push(`/student/test/${testId}/attempt`);
	};

	if (loading) return <Loader size={35} message="Loading Tests..." />;

	if (hasError) {
		return <ErrorState onRetry={fetchTests} />;
	}

	return (
		<main className="flex-1 px-8 py-6 space-y-6">
			<h1 className="text-2xl font-semibold text-primary">Available Tests</h1>

			{tests.length === 0 ?
				<div className="text-center py-12">
					<p className="text-secondary">No tests available right now</p>
				</div>
			:	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{tests.map((test, index) => (
						<div
							key={test.id}
							className="bg-surface border border-default rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-accent-primary transition"
						>
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-primary">Test #{index + 1}</h3>

								<p className="text-sm text-secondary">{test.chapterName}</p>

								<div className="flex items-center gap-4 text-sm text-muted mt-3">
									<div className="flex items-center gap-1">
										<span>📝</span>
										<span>{test.totalQuestions} Questions</span>
									</div>
									<div className="flex items-center gap-1">
										<span>⏱️</span>
										<span>{test.durationMinutes} Minutes</span>
									</div>
								</div>
							</div>

							<button
								onClick={() => handleStartTest(test.id)}
								className="mt-5 w-full py-2 rounded-lg bg-amber-600 text-black font-medium hover:opacity-80 transition cursor-pointer"
							>
								Start Test
							</button>
						</div>
					))}
				</div>
			}
		</main>
	);
}
