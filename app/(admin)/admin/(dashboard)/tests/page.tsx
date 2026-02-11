'use client';

import { Search, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import TestViewSheet from '@/components/admin/tests/TestViewSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/common/Loader';

type TestDetail = {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	questionCount: number;
	attemptCount: number;
	chapter: {
		id: string;
		code: string;
		title: string;
		course: {
			id: string;
			title: string;
		};
	};
};

type ApiResponse = {
	statusCode: number;
	data: TestDetail[];
	message: string;
	success: boolean;
};

export default function AdminTestsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
	const [tests, setTests] = useState<TestDetail[]>([]);
	const [filteredTests, setFilteredTests] = useState<TestDetail[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('search') || '';

	// Fetch tests on mount
	useEffect(() => {
		fetchTests();
	}, []);

	// Filter tests when search query changes
	useEffect(() => {
		if (searchQuery) {
			const filtered = tests.filter(
				(test) =>
					test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					test.chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					test.chapter.course.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredTests(filtered);
		} else {
			setFilteredTests(tests);
		}
	}, [searchQuery, tests]);

	const fetchTests = async () => {
		try {
			// -----------------------------
			// UI BRANCH MOCK DATA START
			// -----------------------------

			setTests([
				{
					id: '1a409ea5-33d5-4f44-9572-5f1d5be8aa15',
					title: 'HTML',
					durationMinutes: 10,
					totalQuestions: 10,
					questionCount: 10,
					attemptCount: 3,
					chapter: {
						id: '4b1add8b-3d39-4f6f-8790-9ee8595ff123',
						code: 'CH01',
						title: 'HTML',
						course: {
							id: '9f5af464-772b-4454-977f-8df8f292c0dd',
							title: 'Web Development'
						}
					}
				}
			]);

			// -----------------------------
			// UI BRANCH MOCK DATA END
			// -----------------------------

			// TODO: Uncomment this in the main branch
			// setLoading(true);
			// setError(null);

			// const response = await fetch('/api/admin/test', {
			// 	method: 'GET',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	credentials: 'include' // Include cookies for auth
			// });

			// if (!response.ok) {
			// 	throw new Error(`HTTP error! status: ${response.status}`);
			// }

			// const result: ApiResponse = await response.json();

			// if (result.success) {
			// 	setTests(result.data);
			// 	setFilteredTests(result.data);
			// 	toast.success(result.message);
			// } else {
			// 	throw new Error(result.message || 'Failed to fetch tests');
			// }
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tests';
			setError(errorMessage);
			toast.error(errorMessage);
			console.error('Fetch tests error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		// URL search params will handle the filtering via useEffect
		const params = new URLSearchParams(searchParams);
		if (e.target.value) {
			params.set('search', e.target.value);
		} else {
			params.delete('search');
		}
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-[600px]">
				<Loader message="Loading tests..." />
			</div>
		);
	}

	if (error && tests.length === 0) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-black tracking-tight">Tests</h2>
						<p className="text-sm font-medium italic text-ab-text-secondary">
							Create and manage tests for chapters.
						</p>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-[22px] border-2 border-ab-border/80 bg-ab-surface">
					<Loader showIcon={false} message="Failed to load tests" subtitle={error} />
					<Button
						onClick={fetchTests}
						className="mt-6 py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-black tracking-tight">Tests</h2>
					<p className="text-sm font-medium italic text-ab-text-secondary">
						Create and manage tests for chapters.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex justify-between items-center gap-4">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search by test name or chapter..."
						className="h-11 rounded-xl border-2 border-ab-border/80 pl-10 focus-visible:ring-ab-primary/20"
						defaultValue={searchQuery}
						onChange={handleSearch}
					/>
				</div>

				<Button className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer">
					Create Test
				</Button>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border/80 bg-ab-surface shadow-sm">
				{filteredTests.length === 0 ?
					<div className="p-12 text-center">
						<p className="text-lg font-black text-ab-text-primary mb-2">
							{searchQuery ? 'No matching tests found' : 'No tests available'}
						</p>
						<p className="text-sm text-ab-text-secondary">
							{searchQuery ?
								`Try adjusting your search for "${searchQuery}"`
							:	'Create your first test to get started'}
						</p>
					</div>
				:	<Table>
						<TableHeader className="bg-ab-border/20">
							<TableRow className="border-b-2 hover:bg-transparent">
								<TableHead className="py-5 pl-8 text-[11px] font-black uppercase tracking-widest">
									Test
								</TableHead>
								<TableHead className="text-[11px] font-black uppercase tracking-widest">
									Chapter
								</TableHead>
								<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
									Duration
								</TableHead>
								<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
									Questions
								</TableHead>
								<TableHead className="pr-8 text-right text-[11px] font-black uppercase tracking-widest">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{filteredTests.map((test) => (
								<TableRow key={test.id} className="group transition-colors hover:bg-ab-primary/5">
									<TableCell className="py-5 pl-8">
										<div className="flex flex-col">
											<span className="text-[15px] font-black">{test.title}</span>
											<span className="text-[11px] font-bold text-ab-text-secondary">
												{test.chapter.course.title} · {test.chapter.title}
											</span>
										</div>
									</TableCell>

									<TableCell className="font-bold">{test.chapter.code}</TableCell>

									<TableCell className="text-center font-black">
										{test.durationMinutes} min
									</TableCell>

									<TableCell className="text-center font-black">
										{test.questionCount} / {test.totalQuestions}
									</TableCell>

									<TableCell className="pr-8 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0 transition hover:bg-ab-primary/10 hover:text-ab-primary"
												>
													<MoreHorizontal className="h-5 w-5" />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align="end"
												className="rounded-xl border-2 border-ab-border/80"
											>
												<DropdownMenuItem
													className="cursor-pointer font-bold"
													onClick={() => {
														setSelectedTestId(test.id);
														setViewOpen(true);
													}}
												>
													View Test
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer font-bold">
													Update Test
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer font-bold text-ab-pink-text">
													Delete Test
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}
			</div>

			{/* View Test Sheet */}
			<TestViewSheet open={viewOpen} onOpenChange={setViewOpen} testId={selectedTestId} />
		</div>
	);
}
