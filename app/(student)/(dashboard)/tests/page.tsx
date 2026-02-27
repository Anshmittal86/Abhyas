'use client';

import { TestCard } from '@/components/dashboard/test-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loader from '@/components/common/Loader';
import { apiFetch } from '@/lib/apiFetch';

interface TestData {
	testId: string;
	title: string;
	chapterName: string;
	courseName: string;
	durationMinutes: number;
	maxMarks: number;
	maxQuestions: number;
	questionCount: number;
	attempt: {
		attemptId: string;
		status: 'IN_PROGRESS' | 'COMPLETED';
		score: number | null;
		gainedMarks?: number;
		startedAt: string;
		submittedAt: string | null;
		expiresAt: string;
	} | null;
	tab: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function TestsPage() {
	const [tests, setTests] = useState<TestData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		const fetchTests = async () => {
			try {
				const response = await apiFetch('/api/student/tests', {
					method: 'GET'
				});

				if (!response.ok) {
					throw Error(`Error Fetching Tests: ${response.statusText}`);
				}

				const result = await response.json();

				if (result.success && result.data) {
					setTests(result.data);
				}
			} catch (error) {
				console.error('Failed to fetch tests:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTests();
	}, []);

	const sortedTests = [...tests].sort((a, b) => {
		const order: Record<TestData['tab'], number> = { IN_PROGRESS: 0, AVAILABLE: 1, COMPLETED: 2 };
		return order[a.tab] - order[b.tab];
	});

	// Filter tests based on search query
	const filteredTests = sortedTests.filter(
		(test) =>
			test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			test.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			test.chapterName?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Organize tests by tab
	const availableTests = filteredTests.filter((test) => test.tab === 'AVAILABLE');
	const inProgressTests = filteredTests.filter((test) => test.tab === 'IN_PROGRESS');
	const completedTests = filteredTests.filter((test) => test.tab === 'COMPLETED');

	// Calculate time remaining
	const calculateTimeRemaining = (expiresAt: string): string => {
		const now = new Date().getTime();
		const expires = new Date(expiresAt).getTime();
		const diffMs = expires - now;

		if (diffMs <= 0) return '0 mins';

		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) return `${diffMins} mins`;

		const diffHours = Math.floor(diffMins / 60);
		return `${diffHours}h ${diffMins % 60}m`;
	};

	const defaultTab =
		inProgressTests.length > 0 ? 'ongoing'
		: availableTests.length > 0 ? 'available'
		: 'completed';

	if (loading) {
		return (
			<main className="mx-auto flex w-full max-w-7xl items-center justify-center p-8 bg-ab-bg text-ab-text-primary">
				<Loader message="Loading Tests" />
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-7xl space-y-8 px-8 bg-ab-bg text-ab-text-primary">
			{/* Header & Search */}
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Tests</h1>
					<p className="text-ab-text-secondary">Explore and attempt your subject-wise tests.</p>
				</div>

				<div className="relative w-full md:w-72">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search tests..."
						className="border-2 border-ab-border/80 pl-10 focus-visible:ring-ab-primary"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Tabs */}

			<Tabs defaultValue={defaultTab} className="w-full">
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
				<TabsContent value="available" className="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{availableTests.length > 0 ?
						availableTests.map((test) => (
							<TestCard
								key={test.testId}
								testId={test.testId}
								title={test.title}
								course={test.courseName}
								unit={test.chapterName}
								maxMarks={test.maxMarks}
								questions={test.questionCount}
								duration={`${test.durationMinutes}m`}
								status="NEW"
							/>
						))
					:	<div className="col-span-full text-center text-ab-text-secondary">
							No available tests found
						</div>
					}
				</TabsContent>

				{/* Ongoing */}
				<TabsContent value="ongoing" className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{inProgressTests.length > 0 ?
						inProgressTests.map((test) => {
							if (!test.attempt) return null;

							const timeRemaining = calculateTimeRemaining(test.attempt.expiresAt);

							return (
								<TestCard
									key={test.testId}
									testId={test.testId}
									attemptId={test.attempt.attemptId}
									title={test.title}
									course={test.courseName}
									unit={test.chapterName}
									maxMarks={test.maxMarks}
									timeRemaining={timeRemaining}
									status="IN_PROGRESS"
								/>
							);
						})
					:	<div className="col-span-full text-center text-ab-text-secondary">
							No in-progress tests found
						</div>
					}
				</TabsContent>

				{/* Completed */}
				<TabsContent value="completed" className="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{completedTests.length > 0 ?
						completedTests.map((test) => {
							if (!test.attempt || !test.attempt.submittedAt) return null;
							return (
								<TestCard
									key={test.testId}
									testId={test.testId}
									attemptId={test.attempt!.attemptId}
									title={test.title}
									course={test.courseName}
									unit={test.chapterName}
									maxMarks={test.maxMarks}
									status="COMPLETED"
									gainedMarks={test.attempt?.gainedMarks ?? 0}
									attemptDate={test.attempt?.submittedAt ?? undefined}
								/>
							);
						})
					:	<div className="col-span-full text-center text-ab-text-secondary">
							No completed tests found
						</div>
					}
				</TabsContent>
			</Tabs>
		</main>
	);
}
