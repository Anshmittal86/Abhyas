'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';
import { useState, useEffect } from 'react';

type Question = {
	id: string;
	questionText: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	correctOption: string;
};

type Attempt = {
	id: string;
	studentId: string;
	score: number;
	startedAt: string;
	submittedAt: string;
};

type TestDetailResponse = {
	id: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
	createdAt: string;
	admin: {
		id: string;
		name: string;
		email: string;
	};
	chapter: {
		id: string;
		code: string;
		title: string;
		course: {
			id: string;
			title: string;
			description: string | null;
		};
	};
	questions: Question[];
	attempts: Attempt[];
};

type ApiResponse = {
	statusCode: number;
	data: TestDetailResponse;
	message: string;
	success: boolean;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	testId: string | null;
};

export default function TestViewSheet({ open, onOpenChange, testId }: Props) {
	const [test, setTest] = useState<TestDetailResponse | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || !testId) return;

		const fetchTest = async () => {
			try {
				// -----------------------------
				// UI BRANCH MOCK DATA START
				// -----------------------------

				setTest({
					id: '1a409ea5-33d5-4f44-9572-5f1d5be8aa15',
					title: 'HTML',
					durationMinutes: 10,
					totalQuestions: 10,
					createdAt: '2026-01-30T07:08:28.180Z',
					admin: {
						id: '8f15fdb7-9a3d-49bf-a328-1ff264d13451',
						name: 'admin',
						email: 'anshmittal977@gmail.com'
					},
					chapter: {
						id: '4b1add8b-3d39-4f6f-8790-9ee8595ff123',
						code: 'CH01',
						title: 'HTML',
						course: {
							id: '9f5af464-772b-4454-977f-8df8f292c0dd',
							title: 'Web Development',
							description: null
						}
					},
					questions: [
						{
							id: 'ef67c1ab-0181-419c-86a3-e874cc13bbd0',
							questionText: 'Which tag is used to create a hyperlink in HTML?',
							optionA: '<link>',
							optionB: '<a>',
							optionC: '<href>',
							optionD: '<hyperlink>',
							correctOption: 'B'
						},
						{
							id: '70a1e6cb-128c-4014-a7f4-96cd52dfb81a',
							questionText: 'Which HTML tag is used to display an image?',
							optionA: '<image>',
							optionB: '<img>',
							optionC: '<src>',
							optionD: '<picture>',
							correctOption: 'B'
						},
						{
							id: '72ccf3d8-d59d-485b-ad22-86c5a110e6f6',
							questionText: 'What does HTML stand for?',
							optionA: 'Hyper Trainer Marking Language',
							optionB: 'Hyper Text Marketing Language',
							optionC: 'Hyper Text Markup Language',
							optionD: 'Hyper Tool Multi Language',
							correctOption: 'C'
						}
					],
					attempts: [
						{
							id: '6d93bd1c-5b35-49d2-aae0-64c1337bccdb',
							studentId: '025a9048-e096-439e-a993-9f25a45ac10e',
							score: 50,
							startedAt: '2026-02-03T07:55:12.139Z',
							submittedAt: '2026-02-03T07:56:58.784Z'
						},
						{
							id: 'd118da0b-e9b5-4f43-a339-aac7f6412162',
							studentId: '025a9048-e096-439e-a993-9f25a45ac10e',
							score: 0,
							startedAt: '2026-02-08T19:38:49.545Z',
							submittedAt: '2026-02-09T05:22:39.444Z'
						},
						{
							id: 'ccfcb54d-a803-43d9-95db-1c4fffa7f548',
							studentId: '025a9048-e096-439e-a993-9f25a45ac10e',
							score: 20,
							startedAt: '2026-02-09T05:22:39.547Z',
							submittedAt: '2026-02-09T05:28:20.256Z'
						}
					]
				});

				// -----------------------------
				// UI BRANCH MOCK DATA END
				// -----------------------------

				// TODO: Uncomment this in the main branch
				// setLoading(true);

				// const response = await fetch(`/api/admin/test/${testId}`, {
				// 	method: 'GET',
				// 	credentials: 'include',
				// 	headers: {
				// 		'Content-Type': 'application/json'
				// 	}
				// });

				// if (!response.ok) {
				// 	throw new Error(`HTTP error! status: ${response.status}`);
				// }

				// const result: ApiResponse = await response.json();

				// if (result.success) {
				// 	setTest(result.data);
				// } else {
				// 	setTest(null);
				// }
			} catch (error) {
				console.error('Failed to fetch test:', error);
				setTest(null);
			} finally {
				setLoading(false);
			}
		};

		fetchTest();
	}, [testId, open]);

	useEffect(() => {
		if (!open) {
			setTest(null);
		}
	}, [open]);

	if (loading) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<Loader size={35} height="full" showIcon message="Loading Test Details..." />
				</SheetContent>
			</Sheet>
		);
	}

	if (!test) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<p className="text-center text-ab-text-secondary py-10">Test data not available</p>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-4xl h-screen overflow-y-auto bg-ab-surface border-l border-ab-border">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">Test Details</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-8">
					{/* Test Identity */}
					<div className="space-y-1">
						<p className="text-2xl font-black text-ab-text-primary">{test.title}</p>
						<p className="text-xs font-bold text-ab-primary">{test.chapter.code}</p>
						<p className="text-sm text-ab-text-secondary">
							Created on {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
						</p>
					</div>

					{/* Course & Chapter */}
					<div className="space-y-1">
						<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
							Course and Chapter
						</p>
						<p className="font-medium text-ab-text-primary">
							{test.chapter.course.title} → {test.chapter.title}
						</p>
						<p className="text-xs font-bold text-ab-text-secondary">
							Chapter Code: {test.chapter.code}
						</p>
					</div>

					{/* Key Metrics */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-ab-border bg-ab-surface p-4">
						<div>
							<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
								Duration
							</p>
							<p className="text-base font-black text-ab-text-primary">
								{test.durationMinutes} minutes
							</p>
						</div>

						<div>
							<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
								Total Questions
							</p>
							<p className="text-base font-black text-ab-text-primary">{test.totalQuestions}</p>
						</div>

						<div>
							<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
								Attempts
							</p>
							<p className="text-base font-black text-ab-text-primary">{test.attempts.length}</p>
						</div>

						<div>
							<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
								Created By
							</p>
							<p className="text-xs font-black text-ab-text-primary">{test.admin.name}</p>
						</div>
					</div>

					{/* Questions */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Questions ({test.questions.length})
						</p>

						{test.questions.slice(0, 3).map((question) => (
							<div
								key={question.id}
								className="p-4 bg-ab-bg/50 rounded-lg border-l-4 border-ab-primary"
							>
								<p className="font-black mb-2 text-sm leading-relaxed">{question.questionText}</p>
								<div className="text-xs space-y-1 text-ab-text-secondary">
									<div>A. {question.optionA}</div>
									<div>B. {question.optionB}</div>
									<div>C. {question.optionC}</div>
									<div>D. {question.optionD}</div>
									<div className="text-ab-primary font-bold">
										Correct: <span className="uppercase">{question.correctOption}</span>
									</div>
								</div>
							</div>
						))}

						{test.questions.length > 3 && (
							<p className="text-sm text-ab-text-secondary">
								Showing first 3 of {test.questions.length} questions...
							</p>
						)}
					</div>

					{/* Test Attempts */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Test Attempts ({test.attempts.length})
						</p>

						{test.attempts.length === 0 ?
							<p className="text-sm text-ab-text-secondary">No attempts yet</p>
						:	<div className="space-y-2">
								{test.attempts.slice(0, 5).map((attempt) => (
									<div
										key={attempt.id}
										className="flex justify-between items-center p-3 bg-ab-bg/50 rounded-lg"
									>
										<div className="flex-1">
											<p className="font-black text-sm">
												Student ID: {attempt.studentId.slice(0, 8)}...
											</p>
											<p className="text-xs text-ab-text-secondary">
												{new Date(attempt.startedAt).toLocaleDateString()} -{' '}
												<span className="font-bold text-ab-primary">
													{new Date(attempt.submittedAt).toLocaleDateString()}
												</span>
											</p>
										</div>
										<div className="text-right">
											<p className="text-2xl font-black text-ab-primary">{attempt.score}%</p>
											<p className="text-xs text-ab-text-secondary">Score</p>
										</div>
									</div>
								))}
								{test.attempts.length > 5 && (
									<p className="text-sm text-ab-text-secondary">
										Showing recent 5 of {test.attempts.length} attempts...
									</p>
								)}
							</div>
						}
					</div>

					{/* Actions */}
					<div className="flex gap-2 pt-4">
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
			</SheetContent>
		</Sheet>
	);
}
