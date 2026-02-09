'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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

const MOCK_QUESTIONS: QuestionListItem[] = [
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
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [viewOpen, setViewOpen] = useState(false);
	const [questionToEdit, setQuestionToEdit] = useState<QuestionForEdit | null>(null);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionListItem | null>(null);

	return (
		<main className="flex-1 overflow-auto px-8 py-6 space-y-6 bg-ab-bg">
			{/* Header */}
			<div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-ab-text-primary">Questions</h1>
					<p className="text-sm text-ab-text-secondary">Create and manage questions for tests.</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>Create Question</Button>
			</div>

			{/* List */}
			<div className="bg-ab-surface border border-ab-border/40 rounded-xl overflow-hidden">
				<div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-ab-border/40 text-xs uppercase tracking-wide text-ab-text-muted">
					<div className="col-span-5">Question</div>
					<div className="col-span-2">Test</div>
					<div className="col-span-2">Correct</div>
					<div className="col-span-1">Answers</div>
					<div className="col-span-2">Actions</div>
				</div>

				{MOCK_QUESTIONS.map((q) => (
					<div
						key={q.id}
						className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-ab-border/40 last:border-0 items-center"
					>
						<div className="col-span-5">
							<div className="font-medium text-ab-text-primary line-clamp-2">{q.questionText}</div>
							<div className="text-xs text-ab-text-muted mt-1">
								A:{q.optionA} · B:{q.optionB} · C:{q.optionC} · D:{q.optionD}
							</div>
						</div>

						<div className="col-span-2 text-sm text-ab-text-primary">{q.testTitle}</div>

						<div className="col-span-2">
							<span className="px-2 py-1 text-xs rounded-full border border-ab-green-text text-ab-green-text font-bold">
								{q.correctOption}
							</span>
						</div>

						<div className="col-span-1 text-sm text-ab-text-primary">{q.answerCount}</div>

						<div className="col-span-2 flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setSelectedQuestion(q);
									setViewOpen(true);
								}}
							>
								View
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setQuestionToEdit({
										id: q.id,
										testId: 'test-1',
										questionText: q.questionText,
										optionA: q.optionA,
										optionB: q.optionB,
										optionC: q.optionC,
										optionD: q.optionD,
										correctOption: q.correctOption
									});
									setEditOpen(true);
								}}
							>
								Edit
							</Button>
							<Button size="sm" variant="outline" className="text-ab-pink-text">
								Del
							</Button>
						</div>
					</div>
				))}
			</div>

			{/* View Sheet */}
			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent className="w-full sm:max-w-2xl bg-ab-surface border-l border-ab-border/40">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">Question Details</SheetTitle>
					</SheetHeader>

					{selectedQuestion && (
						<div className="mt-6 space-y-4">
							<div>
								<p className="text-sm text-ab-text-muted">Question</p>
								<p className="font-medium text-ab-text-primary">{selectedQuestion.questionText}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{(['A', 'B', 'C', 'D'] as const).map((opt) => {
									const text = selectedQuestion[`option${opt}` as keyof QuestionListItem] as string;
									const isCorrect = selectedQuestion.correctOption === opt;

									return (
										<div
											key={opt}
											className={`p-3 rounded-lg border ${
												isCorrect ? 'border-ab-green-text bg-ab-green-bg/20' : 'border-ab-border/40'
											}`}
										>
											<p className="text-sm text-ab-text-muted">Option {opt}</p>
											<p
												className={`${
													isCorrect ? 'font-bold text-ab-green-text' : 'text-ab-text-primary'
												}`}
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
									onClick={() => {
										setQuestionToEdit({
											id: selectedQuestion.id,
											testId: 'test-1',
											questionText: selectedQuestion.questionText,
											optionA: selectedQuestion.optionA,
											optionB: selectedQuestion.optionB,
											optionC: selectedQuestion.optionC,
											optionD: selectedQuestion.optionD,
											correctOption: selectedQuestion.correctOption
										});
										setEditOpen(true);
									}}
								>
									Edit Question
								</Button>
								<SheetClose asChild>
									<Button variant="outline">Close</Button>
								</SheetClose>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</main>
	);
}
