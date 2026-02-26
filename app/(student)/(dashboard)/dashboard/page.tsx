'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { TestCard } from '@/components/dashboard/test-card';
import { Moon, Sun } from 'lucide-react';
import { StatBadge } from '@/components/dashboard/stat-badge';
import Loader from '@/components/common/Loader';
import { useEffect, useState } from 'react';
import DashboardData from '@/types/student-dashboard-types';
import { useTheme } from 'next-themes';
import { apiFetch } from '@/lib/apiFetch';

export default function DashboardPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				setLoading(true);
				const response = await apiFetch('/api/student/dashboard', {
					method: 'GET'
				});

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.message || 'Failed to fetch dashboard data');
				}

				setData(result.data);
				setError(null);
			} catch (err) {
				console.error('Dashboard fetch error:', err);
				setError(err instanceof Error ? err.message : 'Failed to load dashboard');
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, []);

	if (loading) {
		return (
			<main className="mx-auto flex w-full max-w-7xl items-center justify-center p-8 bg-ab-bg text-ab-text-primary">
				<Loader message="Loading Dashboard" />
			</main>
		);
	}

	if (error || !data) {
		return (
			<main className="mx-auto w-full max-w-7xl space-y-8 bg-ab-bg p-8 text-ab-text-primary">
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
					{error || 'Failed to load dashboard data'}
				</div>
			</main>
		);
	}

	const { stats, nextAction, recentActivity } = data;

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 bg-ab-bg px-8  text-ab-text-primary">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-ab-text-secondary">Overview of your preparation progress</p>
				</div>

				<button
					className="rounded-full border border-ab-border/80 p-2 transition hover:bg-ab-primary/10"
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				>
					{theme === 'dark' ?
						<Sun className="size-4 text-ab-text-secondary" />
					:	<Moon className="size-4 text-ab-text-secondary" />}
				</button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="Tests" value={stats.totalTests.toString()} />
				<StatCard label="Average Score" value={`${stats.averageScore}%`} />
				<StatCard label="Pending Tests" value={stats.pendingTests.toString()} />
				<StatCard label="Courses" value={stats.enrolledCourses.toString()} />
			</div>

			{/* Stat Badges */}
			<div className="flex flex-wrap gap-3">
				<StatBadge
					value={stats.completedTests.toString()}
					label="Tests Completed"
					variant="green"
				/>
			</div>

			{/* Next Action - Pending Tests */}
			{nextAction && (
				<section>
					<h2 className="mb-4 text-xl font-semibold">
						{nextAction.type === 'RESUME_TEST' ? 'Resume Test' : 'Start Test'}
					</h2>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<TestCard
							testId={nextAction.testId}
							attemptId={nextAction.attemptId}
							title={nextAction.title}
							course={nextAction.courseTitle}
							unit={nextAction.chapterTitle}
							maxMarks={nextAction.maxQuestions ?? 0}
							questions={nextAction.questionCount ?? 0}
							duration={`${nextAction.durationMinutes ?? 0}m`}
							status={nextAction.type === 'RESUME_TEST' ? 'IN_PROGRESS' : 'NEW'}
						/>
					</div>
				</section>
			)}

			{/* Recent Activity */}
			<section>
				<h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
				{recentActivity && (
					<div className="rounded-lg border border-ab-border/50 bg-ab-bg/50 p-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
						<TestCard
							testId={recentActivity.testId}
							attemptId={recentActivity.attemptId}
							title={recentActivity.title}
							course={recentActivity.courseTitle}
							unit={recentActivity.chapterTitle}
							maxMarks={recentActivity.maxQuestions}
							questions={recentActivity.questionCount}
							duration={`${recentActivity.durationMinutes}m`}
							status="COMPLETED"
							gainedMarks={recentActivity.gainedMarks ?? 0}
							attemptDate={recentActivity.submittedAt ?? undefined}
						/>
					</div>
				)}
			</section>

			{/* Empty State */}
			{!recentActivity && (
				<div className="mt-12 flex justify-center">
					<div className="w-full max-w-md rounded-2xl border border-dashed border-ab-border/90 p-12 text-center">
						<p className="italic text-ab-text-secondary">No tests attempted yet</p>
					</div>
				</div>
			)}
		</main>
	);
}
