'use client';

import { Search, MoreHorizontal, SquarePen } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import CreateQuestionFormSheet from '@/components/forms/CreateQuestionFormSheet';
import { QuestionListTypes, SuccessResponseTypes } from '@/types';

export default function AdminQuestionsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [questions, setQuestions] = useState<QuestionListTypes[]>([]);
	const [filteredQuestions, setFilteredQuestions] = useState<QuestionListTypes[]>([]);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionListTypes | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchQuestions = async () => {
		try {
			setLoading(true);

			const res = await fetch('/api/admin/question', {
				method: 'GET',
				credentials: 'include'
			});

			if (!res.ok) {
				throw new Error(`HTTP error ${res.status}`);
			}

			const result = (await res.json()) as SuccessResponseTypes<QuestionListTypes[]>;

			if (result.success) {
				setQuestions(result.data || []);
				setFilteredQuestions(result.data || []);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, []);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase();

		if (!value) {
			setFilteredQuestions(questions);
			return;
		}

		const filtered = questions.filter(
			(q) =>
				q.questionText.toLowerCase().includes(value) || q.testTitle.toLowerCase().includes(value)
		);

		setFilteredQuestions(filtered);
	};

	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-black tracking-tight">Questions</h2>
					<p className="text-sm font-medium italic text-ab-text-secondary">
						Create and manage questions for tests.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex justify-between items-center gap-4">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ab-text-secondary" />
					<Input
						placeholder="Search by question or test..."
						className="h-11 rounded-xl border-2 border-ab-border pl-10 bg-ab-surface"
						onChange={handleSearch}
						value={
							filteredQuestions.length !== questions.length ? filteredQuestions[0].questionText : ''
						}
						disabled={loading}
					/>
				</div>

				<CreateQuestionFormSheet
					trigger={
						<Button className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer">
							<SquarePen className="mr-2 h-5 w-5" />
							Create Question
						</Button>
					}
				/>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border bg-ab-surface shadow-sm">
				<Table>
					<TableHeader className="bg-ab-border/20">
						<TableRow className="border-b-2 border-ab-border">
							<TableHead className="py-5 pl-8 text-[11px] font-black uppercase tracking-widest">
								Question
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Test
							</TableHead>
							<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
								Correct
							</TableHead>
							<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
								Answers
							</TableHead>
							<TableHead className="pr-8 text-right text-[11px] font-black uppercase tracking-widest">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading && (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-10">
									Loading questions...
								</TableCell>
							</TableRow>
						)}

						{filteredQuestions.map((q) => (
							<TableRow key={q.id} className="hover:bg-ab-primary/5">
								{/* Question */}
								<TableCell className="py-5 pl-8 max-w-xl">
									<p className="font-black line-clamp-2">{q.questionText}</p>

									<p className="text-xs text-ab-text-secondary mt-1">
										{q.questionType} • {q.marks} marks
									</p>
								</TableCell>

								{/* Test */}
								<TableCell className="font-bold">{q.test.title}</TableCell>

								{/* Question Type */}
								<TableCell className="text-center font-black">{q.questionType}</TableCell>

								{/* Answer count */}
								<TableCell className="text-center font-black">{q.answerCount}</TableCell>

								{/* Actions */}
								<TableCell className="pr-8 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => {
													setSelectedQuestion(q);
													setViewOpen(true);
												}}
											>
												View Question
											</DropdownMenuItem>

											<DropdownMenuItem className="text-ab-pink-text">
												Delete Question
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
