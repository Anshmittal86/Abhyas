'use client';

import { Search, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type TestDetail = {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	questionCount: number;
	attemptCount: number;
	chapter: {
		code: string;
		title: string;
		course: {
			title: string;
		};
	};
};

const DUMMY_SELECTED_TEST: TestDetail = {
	id: '1a409ea5-33d5-4f44-9572-5f1d5be8aa15',
	title: 'HTML Basics Test',
	durationMinutes: 10,
	totalQuestions: 10,
	questionCount: 10,
	attemptCount: 3,
	chapter: {
		code: 'CH01',
		title: 'HTML',
		course: {
			title: 'Web Development'
		}
	}
};

export default function AdminTestsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const DUMMY_TESTS: TestDetail[] = [DUMMY_SELECTED_TEST];
	const [tests, setTests] = useState<TestDetail[]>(DUMMY_TESTS);
	const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null);

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
					/>
				</div>

				<Button className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer">
					Create Test
				</Button>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border/80 bg-ab-surface shadow-sm">
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
						{tests.map((test) => (
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

								<TableCell className="text-center font-black">{test.durationMinutes} min</TableCell>

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
													setViewOpen(true);
													setSelectedTest(test);
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
			</div>

			{/* View Test Sheet – unchanged */}
			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">Test Details</SheetTitle>
					</SheetHeader>

					{selectedTest && (
						<div className="mt-6 space-y-6">
							{/* Test Identity */}
							<div className="space-y-1">
								<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
									Test Title
								</p>
								<p className="text-lg font-black text-ab-text-primary">{selectedTest.title}</p>
							</div>

							{/* Course & Chapter */}
							<div className="space-y-1">
								<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
									Course and Chapter
								</p>
								<p className="font-medium text-ab-text-primary">
									{selectedTest.chapter.course.title} → {selectedTest.chapter.title}
								</p>
								<p className="text-xs font-bold text-ab-text-secondary">
									Chapter Code: {selectedTest.chapter.code}
								</p>
							</div>

							{/* Key Metrics */}
							<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border bg-ab-surface p-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Duration
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedTest.durationMinutes} minutes
									</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Attempts
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedTest.attemptCount}
									</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Total Questions
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedTest.totalQuestions}
									</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Added Questions
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedTest.questionCount}
									</p>
								</div>
							</div>

							{/* Admin Actions */}
							<div className="pt-4 flex gap-2">
								<Button
									variant="outline"
									className="font-bold border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
								>
									Update Test
								</Button>

								<Button
									variant="outline"
									className="font-bold text-ab-pink-text border-ab-border hover:bg-ab-pink-bg"
								>
									Delete Test
								</Button>

								<SheetClose asChild>
									<Button variant="outline" className="border-ab-border text-ab-text-primary">
										Close
									</Button>
								</SheetClose>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
