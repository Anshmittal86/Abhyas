'use client';

import { Search, MoreHorizontal, SquarePen, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

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
// import CreateQuestionFormSheet from '@/components/forms/CreateQuestionFormSheet';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import Loader from '@/components/common/Loader';
import { EmptyQuestions } from '@/components/admin/questions/EmptyQuestions';
import { QuestionListTypes, SuccessResponseTypes } from '@/types';
import { deleteQuestion } from '@/lib/api';
import { handleFormBtnLoading } from '@/components/common/HandleFormLoading';
import { useRouter } from 'next/navigation';

export default function AdminQuestionsPage() {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('search') || '';

	const router = useRouter();

	const [viewOpen, setViewOpen] = useState(false);
	const [questions, setQuestions] = useState<QuestionListTypes[]>([]);
	const [filteredQuestions, setFilteredQuestions] = useState<QuestionListTypes[]>([]);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionListTypes | null>(null);
	const [loading, setLoading] = useState(false);
	const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
		id: string;
		question: QuestionListTypes;
	} | null>(null);

	// Filter questions when search query changes
	useEffect(() => {
		if (searchQuery) {
			const filtered = questions.filter(
				(q) =>
					q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
					q.test.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredQuestions(filtered);
		} else {
			setFilteredQuestions(questions);
		}
	}, [searchQuery, questions]);

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
		const params = new URLSearchParams(searchParams);
		if (e.target.value) {
			params.set('search', e.target.value);
		} else {
			params.delete('search');
		}
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const handleClearSearch = () => {
		const params = new URLSearchParams(searchParams);
		params.delete('search');
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			setDeletingQuestionId(questionId);

			await deleteQuestion(questionId);

			// Remove from lists
			setQuestions((prev) => prev.filter((q) => q.id !== questionId));
			setFilteredQuestions((prev) => prev.filter((q) => q.id !== questionId));

			toast.success('Question deleted successfully');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete question';
			toast.error(message);
			console.error('Delete question error:', error);
		} finally {
			setDeletingQuestionId(null);
			setShowDeleteConfirm(null);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
				<Loader message="Loading questions..." />
			</div>
		);
	}

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
				<div className="relative w-full max-w-sm group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ab-text-secondary" />
					<Input
						placeholder="Search by question or test..."
						className="h-11 rounded-xl border-2 border-ab-border pl-10 pr-10 bg-ab-surface focus-visible:ring-ab-primary/20"
						onChange={handleSearch}
						value={searchQuery}
						disabled={loading}
					/>
					{searchQuery && (
						<button
							onClick={handleClearSearch}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-ab-text-secondary hover:text-ab-text-primary transition-colors"
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				<Button
					className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
					onClick={() => router.push('/admin/tests')}
				>
					<SquarePen className="mr-2 h-5 w-5" />
					Create Question
				</Button>
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
						{filteredQuestions.length === 0 ?
							<TableRow>
								<TableCell colSpan={5}>
									<EmptyQuestions onSuccess={fetchQuestions} />
								</TableCell>
							</TableRow>
						:	filteredQuestions.map((q) => (
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

											<DropdownMenuContent align="end" className="w-48">
												<DropdownMenuItem
													onClick={() => {
														setSelectedQuestion(q);
														setViewOpen(true);
													}}
													className="cursor-pointer"
												>
													<SquarePen className="mr-2 h-4 w-4" />
													View Question
												</DropdownMenuItem>

												<AlertDialogBox
													name={q.questionText.substring(0, 50)}
													title="Delete Question?"
													description="This question will be permanently deleted. Make sure no students have attempted it. This action cannot be undone."
													onConfirm={() => handleDeleteQuestion(q.id)}
													trigger={
														<Button
															variant="ghost"
															className="w-full justify-start font-bold text-ab-pink-text hover:bg-ab-pink-bg/40 h-8 px-2"
															disabled={deletingQuestionId === q.id}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															{handleFormBtnLoading(
																deletingQuestionId === q.id,
																'Delete',
																'Deleting...'
															)}
														</Button>
													}
												/>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
