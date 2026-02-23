// app/dashboard/page.tsx
import { StatCard } from '@/components/dashboard/stat-card';
import { TestCard } from '@/components/dashboard/test-card';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatBadge } from '@/components/dashboard/stat-badge';
// ✅
export default function DashboardPage() {
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
				<StatCard label="Tests" value="10" />
				<StatCard label="Average Score" value="80%" />
				<StatCard label="Pending Tests" value="5" />
				<StatCard label="Courses" value="1" />
			</div>

			{/* Stat Badges */}
			<div className="flex flex-wrap gap-3">
				<StatBadge value="350" label="Marks Earned" variant="green" />
			</div>

			<section>
				<h3 className="mb-4 text-xl font-semibold">New Tests</h3>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<TestCard
						title="HTML"
						course="O Level"
						unit="IT Tools"
						maxMarks={100}
						questions={100}
						duration="60m"
					/>
					<TestCard
						title="HTML"
						course="O Level"
						unit="IT Tools"
						maxMarks={100}
						questions={100}
						duration="60m"
					/>
				</div>
			</section>

			<section className="flex gap-4">
				<div className="flex-1">
					<h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
					<TestCard
						title="CCC"
						course="O Level"
						maxMarks={100}
						unit="IT Tools"
						status="completed"
						score="80"
					/>
				</div>

				<div className="flex-1">
					<h3 className="mb-4 text-xl font-semibold">Pending Tests</h3>
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-xl border border-ab-border/80 p-4"
							>
								<div>
									<p className="text-xs text-ab-text-secondary">unit name</p>
									<p className="font-medium text-ab-text-primary">chapter name</p>
								</div>

								<Button variant="outline" size="sm">
									START
								</Button>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Empty State */}
			<div className="mt-12 flex justify-center">
				<div className="w-full max-w-md rounded-2xl border border-dashed border-ab-border/80 p-12 text-center">
					<p className="italic text-ab-text-secondary">No tests attempted yet</p>
				</div>
			</div>
		</main>
	);
}
