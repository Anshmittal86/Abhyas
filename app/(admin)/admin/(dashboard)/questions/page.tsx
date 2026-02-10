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

type QuestionListItem = {
	id: string;
	questionText: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	correctOption: 'A' | 'B' | 'C' | 'D';
	testTitle: string;
	answerCount: number;
};

const QUESTIONS: QuestionListItem[] = [
	{
		id: 'q1',
		questionText: 'What does HTML stand for?',
		optionA: 'Hyper Text Markup Language',
		optionB: 'High Text Machine Language',
		optionC: 'Hyperlinks and Text Markup Language',
		optionD: 'None',
		correctOption: 'A',
		testTitle: 'HTML Basics',
		answerCount: 24
	}
];

export default function AdminQuestionsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionListItem | null>(null);

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
					/>
				</div>

				<Button className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer">
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
						{QUESTIONS.map((q) => (
							<TableRow key={q.id} className="hover:bg-ab-primary/5 transition-colors">
								<TableCell className="py-5 pl-8 max-w-xl">
									<p className="font-black line-clamp-2 text-ab-text-primary">{q.questionText}</p>
									<p className="text-xs text-ab-text-secondary mt-1 line-clamp-1">
										A:{q.optionA} · B:{q.optionB} · C:{q.optionC} · D:{q.optionD}
									</p>
								</TableCell>

								<TableCell className="font-bold text-ab-text-primary">{q.testTitle}</TableCell>

								{/* Correct Option Pill */}
								<TableCell className="text-center">
									<span className="inline-flex h-7 w-7 items-center justify-center rounded-full border font-black bg-ab-green-bg text-ab-green-text border-ab-green-text">
										{q.correctOption}
									</span>
								</TableCell>

								<TableCell className="text-center font-black text-ab-text-primary">
									{q.answerCount}
								</TableCell>

								<TableCell className="pr-8 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-ab-primary/10">
												<MoreHorizontal className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent
											align="end"
											className="rounded-xl bg-ab-surface border border-ab-border"
										>
											<DropdownMenuItem
												className="font-bold"
												onClick={() => {
													setSelectedQuestion(q);
													setViewOpen(true);
												}}
											>
												View Question
											</DropdownMenuItem>
											<DropdownMenuItem className="font-bold">Edit Question</DropdownMenuItem>
											<DropdownMenuItem className="font-bold text-ab-pink-text">
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

			{/* View Question Sheet */}
			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">Question Details</SheetTitle>
					</SheetHeader>

					{selectedQuestion && (
						<div className="mt-6 space-y-6">
							<div>
								<p className="text-xs uppercase font-bold text-ab-text-secondary">Question</p>
								<p className="text-lg font-black text-ab-text-primary">
									{selectedQuestion.questionText}
								</p>
							</div>

							{/* Options */}
							<div className="grid grid-cols-2 gap-4">
								{(['A', 'B', 'C', 'D'] as const).map((opt) => {
									const text = selectedQuestion[`option${opt}` as keyof QuestionListItem] as string;
									const correct = selectedQuestion.correctOption === opt;

									return (
										<div
											key={opt}
											className={`rounded-xl border p-4 ${
												correct ? 'border-ab-green-text bg-ab-green-bg' : 'border-ab-border'
											}`}
										>
											<p className="text-xs font-bold text-ab-text-secondary">Option {opt}</p>
											<p
												className={
													correct ?
														'font-black text-ab-green-text'
													:	'font-medium text-ab-text-primary'
												}
											>
												{text}
											</p>
										</div>
									);
								})}
							</div>

							<div className="pt-4 flex gap-2">
								<Button
									variant="outline"
									className="font-bold border-ab-border text-ab-text-primary"
								>
									Edit Question
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
