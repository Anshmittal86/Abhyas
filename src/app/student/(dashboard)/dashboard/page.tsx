'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import QuickActions from '@/components/QuickActions';
import AccountInfo from '@/components/AccountInfo';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { apiFetch } from '@/lib/apiFetch';

interface DashboardData {
	student: {
		name: string;
		email: string;
		provisionalNo: string;
	};
	enrolledCourses: number;
	completedTests: number;
	averageScore: number;
	pendingTests: number;
}

export default function Dashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			try {
				const response = await apiFetch('/api/student/dashboard', {
					headers: {
						'Content-Type': 'application/json'
					},
					signal: controller.signal
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}
				const result = await response.json();
				setData(result.data || []);
			} catch (error) {
				if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
					window.location.href = '/student-login';
					return;
				}

				console.error('Dashboard error:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		return () => controller.abort();
	}, []);

	return (
		<main className="flex-1 overflow-auto px-8 py-6 space-y-10">
			{loading ?
				<LoadingState />
			: data ?
				<>
					{/* Welcome Section */}
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-semibold text-primary">
							Welcome back, {data.student.name}!
						</h1>
						<p className="text-sm text-secondary">Roll No: {data.student.provisionalNo}</p>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						<StatsCard
							label="Enrolled Courses"
							value={data.enrolledCourses}
							borderColor="accent-primary"
							iconColor="accent-primary"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z"
									/>
								</svg>
							}
						/>
						<StatsCard
							label="Tests Completed"
							value={data.completedTests}
							borderColor="accent-success"
							iconColor="accent-success"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							}
						/>
						<StatsCard
							label="Average Score"
							value={`${data.averageScore}%`}
							borderColor="accent-warning"
							iconColor="accent-warning"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							}
						/>
						<StatsCard
							label="Pending Tests"
							value={data.pendingTests}
							borderColor="accent-error"
							iconColor="accent-error"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							}
						/>
					</div>

					{/* Quick Actions and Account Info */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<QuickActions />
						</div>
						<AccountInfo
							name={data.student.name}
							email={data.student.email}
							rollNumber={data.student.provisionalNo}
						/>
					</div>
				</>
			:	<ErrorState onRetry={() => window.location.reload()} />}
		</main>
	);
}
