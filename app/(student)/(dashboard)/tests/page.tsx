import { TestCard } from '@/components/dashboard/test-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
// ✅
export default function TestsPage() {
	return (
		<main className="mx-auto w-full max-w-7xl space-y-8 p-8 bg-ab-bg text-ab-text-primary">
			{/* Header & Search */}
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tests</h1>
					<p className="text-ab-text-secondary">Explore and attempt your subject-wise tests.</p>
				</div>

				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search tests..."
						className="border-2 border-ab-border/80 pl-10 focus-visible:ring-ab-primary"
					/>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="available" className="w-full">
				<TabsList className="mb-8 bg-ab-border/20 p-1">
					<TabsTrigger
						value="available"
						className="px-8 font-bold data-[state=active]:bg-ab-primary data-[state=active]:text-primary-foreground"
					>
						Available
					</TabsTrigger>

					<TabsTrigger
						value="ongoing"
						className="px-8 font-bold data-[state=active]:bg-ab-primary data-[state=active]:text-primary-foreground"
					>
						In Progress
					</TabsTrigger>

					<TabsTrigger
						value="completed"
						className="px-8 font-bold data-[state=active]:bg-ab-primary data-[state=active]:text-primary-foreground"
					>
						Completed
					</TabsTrigger>
				</TabsList>

				{/* Available */}
				<TabsContent
					value="available"
					className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
				>
					<TestCard
						title="HTML"
						course="O Level"
						unit="IT Tools"
						maxMarks={100}
						questions={100}
						duration="60m"
					/>
					<TestCard
						title="Python"
						course="O Level"
						unit="Programming"
						maxMarks={100}
						questions={50}
						duration="45m"
					/>
				</TabsContent>

				{/* Ongoing */}
				<TabsContent
					value="ongoing"
					className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
				>
					<TestCard
						title="CSS Basics"
						course="O Level"
						unit="Web Design"
						maxMarks={50}
						status="in_progress"
						timeRemaining="12 mins"
					/>
				</TabsContent>

				{/* Completed */}
				<TabsContent
					value="completed"
					className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
				>
					<TestCard
						title="Networking"
						course="O Level"
						unit="IT Tools"
						maxMarks={100}
						status="completed"
						score="85"
					/>
				</TabsContent>
			</Tabs>
		</main>
	);
}
