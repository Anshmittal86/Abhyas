'use client';

import { FileText, Database, UserPlus2, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentFormSheet } from '@/components/forms/StudentFormSheet';
import { useEffect, useState } from 'react';
import { getAdminDashboardData } from '@/lib/api';
import { AdminDashboardData } from '@/types/admin-dashboard-types';
import { toast } from 'sonner';
import { StatCard } from '@/components/dashboard/stat-card';
import Loader from '@/components/common/Loader';
import { useTheme } from 'next-themes';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BulkUploadFlow } from '@/components/admin/questions/BulkUploadFlow';

dayjs.extend(relativeTime);

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const AdminDashboard = () => {
	const [dashboard, setDashboard] = useState<AdminDashboardData>();
	const [loading, setloading] = useState(true);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		async function loadDashboard() {
			try {
				const data = await getAdminDashboardData();

				if (!data) {
					throw Error('Error getting admin dashboard data');
				}

				setDashboard(data);
				console.log(dashboard);
			} catch (error) {
				if (error instanceof Error) {
					toast.error('Something is wrong');
					console.error(`Admin Dashboard: ${error.message}`);
				}

				console.error(`Error Fetching Admin Dashboard`);
			} finally {
				setloading(false);
			}
		}
		loadDashboard();
	}, []);

	function getPerformanceLabel(percentage: number): string {
		if (percentage < 40) return 'Bad';
		if (percentage < 60) return 'Average';
		if (percentage < 80) return 'Good';
		return 'Excellent';
	}

	const performanceBadgeMap: Record<string, BadgeVariant> = {
		Bad: 'destructive',
		Average: 'secondary',
		Good: 'default',
		Excellent: 'outline'
	};

	function getBadgeVariant(message: string): BadgeVariant {
		return performanceBadgeMap[message] ?? 'outline';
	}

	function getRelativeDay(dateString: string): string {
		const date = dayjs(dateString);
		const now = dayjs();

		const diffInDays = now.startOf('day').diff(date.startOf('day'), 'day');

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';

		return `${diffInDays} days ago`;
	}

	if (loading) {
		return <Loader message="Loading Dashboard" />;
	}

	return (
		<div className="space-y-8 p-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-black tracking-tight text-ab-text-primary">
						Admin Dashboard
					</h1>
					<p className="font-medium text-ab-text-secondary">System overview and key metrics</p>
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
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{dashboard?.stats && (
					<>
						<StatCard label="Total Students" value={dashboard.stats.totalStudents} />
						<StatCard label="Total Tests" value={dashboard.stats.totalTests} />
						<StatCard label="Total Questions" value={dashboard.stats.totalQuestions} />
						<StatCard label="Today's Attempts" value={dashboard.stats.todayAttempts} />
					</>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-7">
				{/* Recent Activity */}
				<Card className="md:col-span-4 bg-ab-bg rounded-2xl border-2 border-ab-border/80 shadow-sm">
					<CardHeader>
						<CardTitle className="text-xl font-bold">Recent Student Activity</CardTitle>
						<CardDescription className="font-medium text-ab-text-secondary">
							Live practice results
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="space-y-5">
							{dashboard?.recentActivities.map((activity, index) => {
								const performance = getPerformanceLabel(activity.score);
								const relativeDay = getRelativeDay(activity.submittedAt);
								return (
									<div
										key={index}
										className="flex items-center justify-between rounded-xl border border-ab-border/70 px-4 py-3"
									>
										<div className="flex flex-col">
											<p className="text-sm font-bold text-ab-text-primary">
												{activity.studentName}
											</p>
											<p className="text-xs font-medium text-ab-text-secondary">
												{activity.testTitle}
											</p>
										</div>

										<div className="text-sm font-semibold text-ab-text-secondary">
											{relativeDay}
										</div>

										<div className="text-sm font-black text-ab-text-primary">{activity.score}%</div>

										<Badge variant={getBadgeVariant(performance)}>{performance}</Badge>
									</div>
								);
							})}
						</div>

						<Button
							variant="outline"
							className="mt-6 w-full rounded-xl border-ab-border/80 font-bold transition bg-ab-primary hover:bg-ab-primary/80 text-primary-foreground cursor-pointer"
						>
							View Detailed Analytics
							<ArrowUpRight className="ml-2 size-4" />
						</Button>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="md:col-span-3 bg-ab-bg rounded-2xl border-2 border-ab-border/80 shadow-sm">
					<CardHeader>
						<CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
					</CardHeader>

					<CardContent className="space-y-5">
						<div className="grid grid-cols-2 gap-4">
							{/* Add Student */}
							<StudentFormSheet
								trigger={
									<div className="group cursor-pointer rounded-2xl border border-ab-border/70 bg-ab-primary/5 p-6 transition hover:bg-ab-primary/10 hover:shadow-md">
										<div className="flex flex-col items-center justify-center gap-3 text-center">
											<UserPlus2 className="h-6 w-6 text-ab-primary transition group-hover:scale-110" />
											<p className="text-sm font-bold text-ab-text-primary">Add Student</p>
										</div>
									</div>
								}
							/>

							{/* Create Test */}
							<div className="group cursor-pointer rounded-2xl border border-ab-border/70 bg-ab-primary/5 p-6 transition hover:bg-ab-primary/10 hover:shadow-md">
								<div className="flex flex-col items-center justify-center gap-3 text-center">
									<FileText className="h-6 w-6 text-ab-primary transition group-hover:scale-110" />
									<p className="text-sm font-bold text-ab-text-primary">Create New Test</p>
								</div>
							</div>
						</div>

						{/* Upload Bulk */}
						<Dialog>
							<DialogTrigger asChild>
								<div className="group cursor-pointer rounded-2xl border border-dashed border-ab-border/70 bg-ab-primary/5 p-8 transition hover:bg-ab-primary/10 hover:shadow-md">
									<div className="flex flex-col items-center justify-center gap-4 text-center">
										<Database className="h-7 w-7 text-ab-primary transition group-hover:-translate-y-1" />
										<p className="text-base font-bold text-ab-text-primary">
											Upload Bulk Questions
										</p>
									</div>
								</div>
							</DialogTrigger>

							<DialogContent className="rounded-2xl max-w-lg">
								<DialogHeader>
									<DialogTitle>Bulk Upload Questions</DialogTitle>
								</DialogHeader>

								<BulkUploadFlow tests={dashboard?.testsWithQuestionCount ?? []} />
							</DialogContent>
						</Dialog>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminDashboard;
