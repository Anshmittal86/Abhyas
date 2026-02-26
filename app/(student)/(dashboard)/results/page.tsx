'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TestResultItem, AllTestResultsData, SuccessResponseTypes } from '@/types';
import { StatCard } from '@/components/dashboard/stat-card';

export default function StudentResultsPage() {
	const router = useRouter();

	const [data, setData] = useState<AllTestResultsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

	const fetchResults = useCallback(async () => {
		setLoading(true);
		setHasError(false);

		try {
			const response = await apiFetch('/api/student/results');
			if (!response.ok) throw new Error(`API error: ${response.status}`);
			const result = (await response.json()) as SuccessResponseTypes<AllTestResultsData>;
			setData(result.data ?? null);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				router.replace('/student-login');
				return;
			}
			console.error('Results fetch error:', error);
			setHasError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchResults();
	}, [fetchResults]);

	const toggleTestExpand = (testId: string) => {
		const newExpanded = new Set(expandedTests);
		if (newExpanded.has(testId)) {
			newExpanded.delete(testId);
		} else {
			newExpanded.add(testId);
		}
		setExpandedTests(newExpanded);
	};

	// Group attempts by test
	const groupedByTest = new Map<string, TestResultItem[]>();
	if (data?.allResults) {
		data.allResults.forEach((attempt) => {
			const key = attempt.testId;
			if (!groupedByTest.has(key)) {
				groupedByTest.set(key, []);
			}
			groupedByTest.get(key)!.push(attempt);
		});
	}

	if (loading) return <Loader size={35} message="Loading Results" />;
	if (hasError) return <ErrorState onRetry={fetchResults} />;

	if (!data || groupedByTest.size === 0) {
		return (
			<main className="flex-1 px-8 space-y-6 bg-ab-bg text-ab-text-primary">
				<div className="space-y-1">
					<h1 className="text-2xl font-black text-ab-text-primary">Results</h1>
					<p className="text-sm font-medium text-ab-text-secondary">Track your test performance</p>
				</div>

				<div className="bg-ab-surface border border-ab-border rounded-xl p-12 text-center shadow-sm">
					<p className="text-ab-text-secondary mb-4 font-medium">
						No test results yet. Start taking tests to see your results here!
					</p>

					<Button
						onClick={() => router.push('/tests')}
						className="bg-ab-primary hover:bg-ab-primary-soft text-white font-bold"
					>
						Take a Test
					</Button>
				</div>
			</main>
		);
	}

	const summary = data.summary;

	return (
		<main className="flex-1 px-8 space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold text-ab-text-primary">Results</h1>
					<p className="text-sm text-ab-text-secondary">Track your test performance</p>
				</div>

				<Button
					onClick={() => router.push('/tests')}
					variant="outline"
					className="border-ab-border bg-ab-primary text-primary-foreground hover:text-primary-foreground/90 hover:bg-ab-primary/90 font-semibold cursor-pointer"
				>
					Back to Tests
				</Button>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<StatCard label="Total Tests Attempted" value={summary.totalResults} />
				<StatCard label="Average Score" value={`${summary.averageScore}%`} />
				<StatCard label="Total Score" value={summary.totalScore} />
			</div>

			{/* All Tests Section */}
			<div className="bg-surface border border-dashed rounded-xl p-5 space-y-3">
				<h2 className="text-lg font-semibold text-ab-text-primary">All Test Results</h2>

				{groupedByTest.size === 0 ?
					<p className="text-ab-text-secondary text-sm">No test attempts found.</p>
				:	<div className="space-y-2">
						{Array.from(groupedByTest.entries()).map(([testId, attempts]) => {
							const firstAttempt = attempts[0];
							const latestAttempt = attempts[0]; // Already sorted by submittedAt desc
							const isExpanded = expandedTests.has(testId);
							const bestScore = Math.max(...attempts.map((a) => a.score || 0));
							const avgScore = Math.round(
								attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
							);

							return (
								<div
									key={testId}
									className="border border-default rounded-lg overflow-hidden bg-ab-surface"
								>
									{/* Test Header */}
									<button
										onClick={() => toggleTestExpand(testId)}
										className="w-full px-4 py-3 flex items-center justify-between transition"
									>
										<div className="flex-1 text-left space-y-1">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-ab-text-primary">
													{firstAttempt.testTitle}
												</h3>
												<span className="text-xs bg-ab-primary/90 text-white px-2 py-1 rounded">
													{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
												</span>
											</div>
											<p className="text-xs text-ab-text-secondary">
												{firstAttempt.courseName} • {firstAttempt.chapterName}
											</p>
										</div>

										{/* Quick Stats */}
										<div className="flex items-center gap-6 mr-3">
											<div className="text-right">
												<div className="text-sm font-semibold text-ab-text-primary">
													{latestAttempt.score}%
												</div>
												<div className="text-xs text-ab-text-secondary">Latest</div>
											</div>
											<div className="text-right">
												<div className="text-sm font-semibold text-ab-text-primary">
													{bestScore}%
												</div>
												<div className="text-xs text-ab-text-secondary">Best</div>
											</div>
											<div className="text-right">
												<div className="text-sm font-semibold text-ab-text-primary">
													{avgScore}%
												</div>
												<div className="text-xs text-ab-text-secondary">Average</div>
											</div>
											{isExpanded ?
												<ChevronUp className="w-5 h-5 text-ab-text-secondary" />
											:	<ChevronDown className="w-5 h-5 text-ab-text-secondary" />}
										</div>
									</button>

									{/* Expanded Attempt History */}
									{isExpanded && (
										<div className="border-t border-default bg-ab-bg/50 divide-y divide-default">
											{attempts.map((attempt, idx) => (
												<div key={attempt.id} className="px-4 py-3">
													<div className="flex flex-wrap items-center justify-between gap-3">
														<div className="text-sm text-ab-text-secondary">
															Attempt {attempts.length - idx} •{' '}
															{new Date(attempt.submittedAt).toLocaleString()}
														</div>
														<div className="flex items-center gap-4 text-sm">
															<span className="text-ab-text-primary font-medium">
																{attempt.score || 0}%
															</span>
															<span className="text-ab-text-secondary">
																Answered: {attempt.answeredQuestions}/{attempt.maxQuestions}
															</span>
															<span className="text-ab-text-secondary">
																Accuracy: {attempt.accuracy}%
															</span>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				}
			</div>

			{/* Course-wise Results Section (Optional) */}
			{data.courseResults && data.courseResults.length > 0 && (
				<div className="bg-surface border border-dashed rounded-xl p-5 space-y-3">
					<h2 className="text-lg font-semibold text-ab-text-primary">Results by Course</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
						{data.courseResults.map((course) => (
							<div
								key={course.courseId}
								className="border border-default rounded-lg p-4 bg-ab-surface"
							>
								<h3 className="font-semibold text-ab-text-primary mb-3">{course.courseTitle}</h3>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-ab-text-secondary">Tests Attempted</span>
										<span className="font-medium text-ab-text-primary">{course.totalTests}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-ab-text-secondary">Average Score</span>
										<span className="font-medium text-ab-text-primary">{course.averageScore}%</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</main>
	);
}
