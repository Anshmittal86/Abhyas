'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { TestCard } from '@/components/dashboard/test-card';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatBadge } from '@/components/dashboard/stat-badge';
import Loader from '@/components/common/Loader';
import { useEffect, useState } from 'react';

interface DashboardData {
	student: {
		id: string;
		name: string;
		email: string;
		provisionalNo: string;
	};
	stats: {
		enrolledCourses: number;
		totalTests: number;
		completedTests: number;
		pendingTests: number;
		averageScore: number;
	};
	nextAction: {
		type: string;
		testId: string;
		title: string;
		durationMinutes: number;
		attemptId?: string;
		courseTitle: string;
		chapterTitle: string;
	} | null;
	recentActivity: {
		testId: string;
		score: number | null;
		submittedAt: string;
	} | null;
}

export default function DashboardPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/student/dashboard', {
					method: 'GET',
					credentials: 'include'
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
				<Loader />
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
		<main className="mx-auto w-full max-w-7xl space-y-8 bg-ab-bg p-8 text-ab-text-primary">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-ab-text-secondary">Overview of your preparation progress</p>
				</div>

				<button className="rounded-full border border-ab-border/80 p-2 transition hover:bg-ab-primary/10">
					<Moon className="size-5 text-ab-text-secondary" />
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
					<h3 className="mb-4 text-xl font-semibold">
						{nextAction.type === 'RESUME_TEST' ? 'Resume Test' : 'Start Test'}
					</h3>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<TestCard
							testId={nextAction.testId}
							attemptId={nextAction.attemptId}
							title={nextAction.title}
							course={nextAction.courseTitle}
							unit={nextAction.chapterTitle}
							maxMarks={100} // Placeholder, replace with actual marks if available
							questions={10} // Placeholder, replace with actual question count if available
							duration={`${nextAction.durationMinutes}m`}
							status={nextAction.type === 'RESUME_TEST' ? 'IN_PROGRESS' : 'NEW'}
						/>
					</div>
				</section>
			)}

			{/* Recent Activity */}
			<section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{recentActivity && (
					<div>
						<h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
						<TestCard
							testId={recentActivity.testId}
							title="Last Attempted Test"
							course="Course"
							maxMarks={100} // Placeholder, replace with actual marks if available
							questions={10} // Placeholder, replace with actual question count if available
							duration={`30m`} // Placeholder, replace with actual duration if available
							unit="Chapter"
							status="COMPLETED"
							gainedMarks={recentActivity.score ?? 0}
							attemptDate={recentActivity.submittedAt}
						/>
					</div>
				)}
			</section>

			{/* Empty State */}
			{stats.totalTests === 0 && (
				<div className="mt-12 flex justify-center">
					<div className="w-full max-w-md rounded-2xl border border-dashed border-ab-border/80 p-12 text-center">
						<p className="italic text-ab-text-secondary">No tests attempted yet</p>
					</div>
				</div>
			)}
		</main>
	);
}
