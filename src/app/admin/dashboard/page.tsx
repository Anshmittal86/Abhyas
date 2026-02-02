'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { apiFetch } from '@/lib/apiFetch';

interface AdminDashboardData {
	totalStudents: number;
	activeStudents: number;
	totalCourses: number;
	totalTests: number;
}

export default function AdminDashboard() {
	const [data, setData] = useState<AdminDashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			try {
				const response = await apiFetch('/api/admin/analytics', {
					headers: {
						'Content-Type': 'application/json'
					},
					signal: controller.signal
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const result = await response.json();
				setData(result.data);
			} catch (error) {
				if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
					window.location.href = '/admin-login';
					return;
				}
				console.error('Admin dashboard error:', error);
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
					{/* Header */}
					<div className="flex flex-col gap-1">
						<h1 className="text-2xl font-semibold text-primary">Admin Dashboard</h1>
						<p className="text-sm text-secondary">System overview and key metrics</p>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						<StatsCard
							label="Total Students"
							value={data.totalStudents}
							borderColor="accent-primary"
							iconColor="accent-primary"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m8-4a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							}
						/>

						<StatsCard
							label="Active Students"
							value={data.activeStudents}
							borderColor="accent-success"
							iconColor="accent-success"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4"
									/>
								</svg>
							}
						/>

						<StatsCard
							label="Total Courses"
							value={data.totalCourses}
							borderColor="accent-warning"
							iconColor="accent-warning"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6l9 4.5-9 4.5-9-4.5L12 6z"
									/>
								</svg>
							}
						/>

						<StatsCard
							label="Total Tests"
							value={data.totalTests}
							borderColor="accent-error"
							iconColor="accent-error"
							icon={
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 17v-6h13v6M5 7h14"
									/>
								</svg>
							}
						/>
					</div>
				</>
			:	<ErrorState onRetry={() => window.location.reload()} />}
		</main>
	);
}
