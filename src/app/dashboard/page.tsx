'use client';

import React, { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavigation from '@/components/TopNavigation';
import StatsCard from '@/components/StatsCard';
import QuickActions from '@/components/QuickActions';
import AccountInfo from '@/components/AccountInfo';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

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
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/api/student/dashboard', {
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include' // ✅ Include cookies in request
				});

				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						// Redirect to login if unauthorized
						window.location.href = '/student-login';
						return;
					}
					throw new Error(`API error: ${response.status}`);
				}

				const result = await response.json();
				console.log('Dashboard data fetched:', result);
				setData(result.data);
			} catch (error) {
				console.error('❌ Failed to fetch dashboard data:', error);
				setData(null); // Clear data on error
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="flex h-screen bg-main">
			{/* Sidebar */}
			<DashboardSidebar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />

			{/* Main Content */}
			<div className="flex-1 sm:ml-64 flex flex-col">
				{/* Top Navigation */}
				<TopNavigation onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-6">
					{loading ?
						<LoadingState />
					: data ?
						<>
							{/* Welcome Section */}
							<div className="mb-8">
								<h1 className="text-3xl font-bold text-primary mb-2">
									Welcome back, {data.student.name}!
								</h1>
								<p className="text-secondary">Roll No: {data.student.provisionalNo}</p>
							</div>

							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<QuickActions />
								<AccountInfo
									name={data.student.name}
									email={data.student.email}
									rollNumber={data.student.provisionalNo}
								/>
							</div>
						</>
					:	<ErrorState onRetry={() => window.location.reload()} />}
				</main>
			</div>
		</div>
	);
}
