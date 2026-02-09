'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type TestListItem = {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	questionCount: number;
	chapter: {
		code: string;
		title: string;
		course: {
			title: string;
		};
	};
};

type TestDetail = {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	chapter: {
		code: string;
		title: string;
		course: {
			title: string;
		};
	};
	questions: Array<{
		id: string;
		questionText: string;
		optionA: string;
		optionB: string;
		optionC: string;
		optionD: string;
		correctOption: 'A' | 'B' | 'C' | 'D';
	}>;
	attempts: number;
};

const MOCK_TESTS: TestListItem[] = [
	{
		id: '1',
		title: 'HTML Basics Test',
		durationMinutes: 60,
		totalQuestions: 50,
		questionCount: 50,
		chapter: {
			code: 'IT-01',
			title: 'HTML Introduction',
			course: { title: 'O Level' }
		}
	}
];

const MOCK_DETAIL: TestDetail = {
	id: '1',
	title: 'HTML Basics Test',
	durationMinutes: 60,
	totalQuestions: 50,
	chapter: {
		code: 'IT-01',
		title: 'HTML Introduction',
		course: { title: 'O Level' }
	},
	attempts: 12,
	questions: [
		{
			id: 'q1',
			questionText: 'What does HTML stand for?',
			optionA: 'Hyper Text Markup Language',
			optionB: 'High Text Machine Language',
			optionC: 'Hyperlinks and Text Markup Language',
			optionD: 'None',
			correctOption: 'A'
		}
	]
};

export default function AdminTestsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null);

	return (
		<main className="flex-1 overflow-auto px-8 py-6 space-y-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold">Tests</h1>
					<p className="text-sm text-muted-foreground">Create and manage tests for chapters.</p>
				</div>
				<Button>Create Test</Button>
			</div>

			<div className="rounded-xl border overflow-hidden">
				<div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-xs uppercase tracking-wide text-muted-foreground">
					<div className="col-span-4">Test</div>
					<div className="col-span-2">Chapter</div>
					<div className="col-span-2">Duration</div>
					<div className="col-span-2">Questions</div>
					<div className="col-span-2">Actions</div>
				</div>

				{MOCK_TESTS.map((t) => (
					<div key={t.id} className="grid grid-cols-12 gap-3 px-4 py-4 border-b items-center">
						<div className="col-span-4">
							<div className="font-medium">{t.title}</div>
							<div className="text-xs text-muted-foreground">
								{t.chapter.course.title} - {t.chapter.title}
							</div>
						</div>
						<div className="col-span-2">{t.chapter.code}</div>
						<div className="col-span-2">{t.durationMinutes} min</div>
						<div className="col-span-2">
							{t.questionCount} / {t.totalQuestions}
						</div>
						<div className="col-span-2 flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setSelectedTest(MOCK_DETAIL);
									setViewOpen(true);
								}}
							>
								View
							</Button>
							<Button size="sm" variant="outline">
								Edit
							</Button>
							<Button size="sm" variant="outline" className="text-red-500">
								Del
							</Button>
						</div>
					</div>
				))}
			</div>

			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent className="sm:max-w-2xl overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Test Details</SheetTitle>
					</SheetHeader>

					{selectedTest && (
						<div className="mt-6 space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Title</p>
								<p className="font-medium">{selectedTest.title}</p>
							</div>

							<div>
								<p className="text-sm text-muted-foreground">Course & Chapter</p>
								<p>
									{selectedTest.chapter.course.title} - {selectedTest.chapter.title} (
									{selectedTest.chapter.code})
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Duration</p>
									<p>{selectedTest.durationMinutes} minutes</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Attempts</p>
									<p>{selectedTest.attempts}</p>
								</div>
							</div>

							<div>
								<p className="text-sm text-muted-foreground font-medium">Questions</p>
								<div className="mt-2 rounded-lg border divide-y">
									{selectedTest.questions.map((q, i) => (
										<div key={q.id} className="p-3 space-y-2">
											<p className="font-medium">
												Q{i + 1}. {q.questionText}
											</p>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<p
													className={
														q.correctOption === 'A' ? 'text-green-600' : 'text-muted-foreground'
													}
												>
													A. {q.optionA}
												</p>
												<p
													className={
														q.correctOption === 'B' ? 'text-green-600' : 'text-muted-foreground'
													}
												>
													B. {q.optionB}
												</p>
												<p
													className={
														q.correctOption === 'C' ? 'text-green-600' : 'text-muted-foreground'
													}
												>
													C. {q.optionC}
												</p>
												<p
													className={
														q.correctOption === 'D' ? 'text-green-600' : 'text-muted-foreground'
													}
												>
													D. {q.optionD}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="pt-4 flex gap-2">
								<Button variant="outline">Edit Test</Button>
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
