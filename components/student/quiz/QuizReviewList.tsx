import { Question, QuizAnswer } from '@/types/quiz';
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizReviewListProps {
	questions: Question[];
	answers: Map<string, QuizAnswer>;
	onBack: () => void;
	onRetry: () => void;
}

export function QuizReviewList({ questions, answers, onBack, onRetry }: QuizReviewListProps) {
	return (
		<div className="min-h-screen bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-ab-surface border-b border-ab-border px-4 py-3">
				<div className="max-w-2xl mx-auto flex items-center justify-between">
					<Button
						variant="outline"
						size="sm"
						onClick={onBack}
						className="gap-1 border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Results
					</Button>

					<Button
						size="sm"
						onClick={onRetry}
						className="gap-1 bg-ab-primary text-white hover:bg-ab-primary-soft font-semibold"
					>
						<RotateCcw className="h-4 w-4" />
						Retry
					</Button>
				</div>
			</header>

			<main className="max-w-2xl mx-auto p-4 py-6 space-y-4">
				<h2 className="text-lg font-black text-ab-text-primary">Answer Review</h2>

				{questions.map((q, index) => {
					const userAnswer = answers.get(q.id);
					const isCorrect = userAnswer?.answer === q.correctAnswer;
					const isSkipped = !userAnswer;

					return (
						<div
							key={q.id}
							className="bg-ab-surface rounded-xl border border-ab-border shadow-sm overflow-hidden"
						>
							{/* Question header */}
							<div
								className={`flex items-center gap-3 px-4 py-3 border-b border-ab-border
							${
								isSkipped ? 'bg-ab-border/30'
								: isCorrect ? 'bg-ab-green-bg'
								: 'bg-ab-pink-bg'
							}
						`}
							>
								{isSkipped ?
									<MinusCircle className="h-5 w-5 text-ab-text-secondary shrink-0" />
								: isCorrect ?
									<CheckCircle2 className="h-5 w-5 text-ab-green-text shrink-0" />
								:	<XCircle className="h-5 w-5 text-ab-pink-text shrink-0" />}

								<span className="text-sm font-semibold text-ab-text-primary">
									Question {index + 1}
								</span>

								<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-ab-purple-bg text-ab-purple-text ml-auto">
									{q.type === 'TRUE_FALSE' ? 'True / False' : 'MCQ'}
								</span>
							</div>

							{/* Question text */}
							<div className="px-4 pt-3 pb-2">
								<p className="text-sm font-medium text-ab-text-primary leading-relaxed">
									{q.question}
								</p>
							</div>

							{/* Options */}
							<div className="px-4 pb-4 space-y-2">
								{q.options?.map((option, i) => {
									const isUserChoice = userAnswer?.answer === option.id;
									const isCorrectOption = q.correctAnswer === option.id;
									const letter = String.fromCharCode(65 + i);

									let borderClass = 'border-ab-border';
									let bgClass = '';
									let iconEl = null;

									if (isCorrectOption) {
										borderClass = 'border-ab-green-text';
										bgClass = 'bg-ab-green-bg';
										iconEl = <CheckCircle2 className="h-4 w-4 text-ab-green-text shrink-0" />;
									} else if (isUserChoice && !isCorrect) {
										borderClass = 'border-ab-pink-text';
										bgClass = 'bg-ab-pink-bg';
										iconEl = <XCircle className="h-4 w-4 text-ab-pink-text shrink-0" />;
									}

									return (
										<div
											key={option.id}
											className={`flex items-center gap-3 rounded-lg border-2 p-3 ${borderClass} ${bgClass}`}
										>
											<span
												className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold
											${
												isCorrectOption ? 'bg-ab-green-text text-white'
												: isUserChoice && !isCorrect ? 'bg-ab-pink-text text-white'
												: 'bg-ab-border text-ab-text-secondary'
											}
										`}
											>
												{letter}
											</span>

											<span className="text-sm text-ab-text-primary flex-1">{option.text}</span>

											{iconEl}

											{isUserChoice && (
												<span className="text-[10px] font-semibold uppercase tracking-wider text-ab-text-secondary">
													Your answer
												</span>
											)}
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</main>
		</div>
	);
}
