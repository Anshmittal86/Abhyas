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
import { TestsListTypes } from '@/types';
import { SuccessResponseTypes } from '@/types';
import CreateTestFormSheet from '@/components/forms/createTestFormSheet';
import { EmptyTests } from '@/components/admin/tests/EmptyTests';
import AlertDialogBox from '@/components/common/AlertDialogBox';

export default function AdminTestsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
	const [tests, setTests] = useState<TestsListTypes[]>([]);
	const [filteredTests, setFilteredTests] = useState<TestsListTypes[]>([]);

	const [loading, setLoading] = useState(true);
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
			setLoading(true);

			const response = await fetch('/api/admin/test', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include' // Include cookies for auth
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = (await response.json()) as SuccessResponseTypes<TestsListTypes[]>;

			if (result.success) {
				setTests(result.data || []);
				setFilteredTests(result.data || []);
				toast.success(result.message);
			} else {
				throw new Error(result.message || 'Failed to fetch tests');
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tests';
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

	const handleDeleteTest = async (testId: string) => {
		try {
			const response = await fetch(`/api/admin/test/${testId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = (await response.json()) as SuccessResponseTypes<null>;

			if (result.success) {
				toast.success(result.message || 'Test deleted successfully');

				await fetchTests();
			} else {
				throw new Error(result.message || 'Failed to delete test');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete test';

			toast.error(errorMessage);

			console.error('Delete test error:', error);
		}
	};

	const handleTestTitleUpdated = (testId: string, newTitle: string) => {
		setTests((prev) =>
			prev.map((test) => (test.id === testId ? { ...test, title: newTitle } : test))
		);

		setFilteredTests((prev) =>
			prev.map((test) => (test.id === testId ? { ...test, title: newTitle } : test))
		);
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
				<Loader message="Loading tests..." />
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

				<CreateTestFormSheet trigger="Create Test" onSuccess={fetchTests} />
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border/80 bg-ab-surface shadow-sm">
				{
					<Table>
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
							{loading ?
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										<Loader size={30} showIcon message="Loading tests..." />
									</TableCell>
								</TableRow>
							: tests.length === 0 ?
								<TableRow>
									<TableCell colSpan={5}>
										<EmptyTests />
									</TableCell>
								</TableRow>
							:	filteredTests.map((test) => (
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
													className="rounded-xl border-2 border-ab-border/80 bg-ab-bg"
												>
													<DropdownMenuItem
														className="cursor-pointer font-bold flex justify-center"
														onClick={() => {
															setSelectedTestId(test.id);
															setViewOpen(true);
														}}
													>
														View Test
													</DropdownMenuItem>

													<AlertDialogBox
														name={test.title}
														onConfirm={() => handleDeleteTest(test.id)}
														trigger={
															<Button
																variant="ghost"
																className="w-full flex justify-center font-bold text-ab-pink-text hover:bg-ab-pink-bg/50 h-8 px-2 cursor-pointer"
															>
																Delete Test
															</Button>
														}
														title="Delete this test?"
														description={`Permanently delete "${test.title}"? All student attempts, answers, and progress for this test will be permanently lost. This action cannot be undone.`}
													/>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							}
						</TableBody>
					</Table>
				}
			</div>

			{/* View Test Sheet */}
			<TestViewSheet
				open={viewOpen}
				onOpenChange={setViewOpen}
				testId={selectedTestId}
				onTitleUpdated={handleTestTitleUpdated}
			/>
		</div>
	);
}
