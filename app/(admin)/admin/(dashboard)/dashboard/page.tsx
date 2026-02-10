import React from 'react';
import {
	Users,
	FileText,
	Database,
	MousePointerClick,
	Plus,
	TrendingUp,
	ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateStudentSheet } from '@/components/forms/CreateStudentSheet';
// ✅
const AdminDashboard = () => {
	const stats = [
		{
			title: 'Total Students',
			value: '1,500+',
			icon: Users,
			trend: '+10%',
			bgColor: 'bg-ab-blue-bg',
			textColor: 'text-ab-blue-text'
		},
		{
			title: 'Tests Created',
			value: '25',
			icon: FileText,
			trend: '-3%',
			bgColor: 'bg-ab-primary/10',
			textColor: 'text-ab-primary'
		},
		{
			title: 'Total Questions',
			value: '10,000+',
			icon: Database,
			trend: '+5%',
			bgColor: 'bg-ab-purple-bg',
			textColor: 'text-ab-purple-text'
		},
		{
			title: "Today's Attempts",
			value: '1,240',
			icon: MousePointerClick,
			trend: '+12%',
			bgColor: 'bg-ab-green-bg',
			textColor: 'text-ab-green-text'
		}
	];

	const recentActivity = [
		{
			name: 'Rahul Sharma',
			test: 'Physics Quiz 01',
			score: '85%',
			status: 'Passed',
			pillBg: 'bg-ab-green-bg',
			pillText: 'text-ab-green-text'
		},
		{
			name: 'Anjali Gupta',
			test: 'Maths Mock Test',
			score: '92%',
			status: 'Passed',
			pillBg: 'bg-ab-green-bg',
			pillText: 'text-ab-green-text'
		},
		{
			name: 'Aryan Khan',
			test: 'Chemistry Unit 1',
			score: '45%',
			status: 'Failed',
			pillBg: 'bg-ab-pink-bg',
			pillText: 'text-ab-pink-text'
		},
		{
			name: 'Sana Verma',
			test: 'Physics Quiz 01',
			score: 'Pending',
			status: 'Review',
			pillBg: 'bg-ab-blue-bg',
			pillText: 'text-ab-blue-text'
		}
	];

	return (
		<div className="space-y-8 p-6">
			<div>
				<h1 className="text-3xl font-black tracking-tight text-ab-text-primary">Admin Dashboard</h1>
				<p className="font-medium text-ab-text-secondary">System overview and key metrics</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card
						key={stat.title}
						className="rounded-2xl border-2 border-ab-border/80 shadow-sm transition-colors bg-ab-bg hover:border-ab-primary/20"
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-[11px] font-bold uppercase tracking-widest opacity-60">
								{stat.title}
							</CardTitle>
							<div className={`rounded-xl p-2 ${stat.bgColor}`}>
								<stat.icon className={`h-4 w-4 ${stat.textColor}`} />
							</div>
						</CardHeader>

						<CardContent>
							<div className="text-2xl font-black text-ab-text-primary">{stat.value}</div>
							<div className="mt-2 flex items-center text-[11px] font-bold">
								<span className={`${stat.textColor} flex items-center`}>
									{stat.trend}
									<TrendingUp className="ml-1 size-3" />
								</span>
								<span className="ml-2 text-ab-text-secondary opacity-70">since last month</span>
							</div>
						</CardContent>
					</Card>
				))}
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
							{recentActivity.map((activity, index) => (
								<div
									key={index}
									className="flex items-center justify-between border-b border-dashed border-ab-border/80 pb-4 last:border-0 last:pb-0"
								>
									<div className="flex items-center gap-3">
										<div className={`h-8 w-1 rounded-full ${activity.pillBg}`} />
										<div>
											<p className="text-sm font-bold leading-none text-ab-text-primary">
												{activity.name}
											</p>
											<p className="text-xs font-medium text-ab-text-secondary">{activity.test}</p>
										</div>
									</div>

									<div className="flex items-center gap-6">
										<div className="text-sm font-black text-ab-text-primary">{activity.score}</div>
										<Badge
											variant="outline"
											className={`${activity.pillBg} ${activity.pillText} rounded-lg border-none px-3 py-1 font-bold`}
										>
											{activity.status}
										</Badge>
									</div>
								</div>
							))}
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

					<CardContent className="space-y-4">
						<CreateStudentSheet classes={'cursor-pointer w-full py-6'} />

						<div className="group relative">
							<Button
								disabled
								className="h-14 w-full rounded-2xl border-2 border-dashed border-ab-border/80 bg-ab-border/20 pl-6 text-left text-lg font-bold text-ab-text-secondary opacity-60"
							>
								Bulk Upload Questions
							</Button>
							<Badge className="absolute right-4 top-4 bg-ab-text-primary text-ab-bg px-1.5 py-0.5 text-[9px] font-black uppercase">
								Coming Soon
							</Badge>
						</div>

						<div className="mt-4 rounded-2xl border border-ab-border/80 bg-ab-primary/5 p-5">
							<h4 className="mb-2 text-[11px] font-black uppercase tracking-tighter text-ab-primary">
								System Insight
							</h4>
							<p className="text-[13px] font-medium leading-relaxed text-ab-text-secondary">
								You can now set{' '}
								<span className="text-xs font-bold italic text-ab-primary">Negative Marking</span>{' '}
								while creating new tests. Check the advanced settings.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminDashboard;
