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
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-card border-b px-4 py-3">
				<div className="max-w-2xl mx-auto flex items-center justify-between">
					<Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
						<ArrowLeft className="h-4 w-4" />
						Back to Results
					</Button>
					<Button size="sm" onClick={onRetry} className="gap-1">
						<RotateCcw className="h-4 w-4" />
						Retry
					</Button>
				</div>
			</header>

			<main className="max-w-2xl mx-auto p-4 py-6 space-y-4">
				<h2 className="text-lg font-bold text-foreground">Answer Review</h2>

				{questions.map((q, index) => {
					const userAnswer = answers.get(q.id);
					const isCorrect = userAnswer?.answer === q.correctAnswer;
					const isSkipped = !userAnswer;

					return (
						<div key={q.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
							{/* Question header with status */}
							<div
								className={`flex items-center gap-3 px-4 py-3 border-b ${
									isSkipped ? 'bg-muted/50'
									: isCorrect ? 'bg-quiz-correct/10'
									: 'bg-quiz-incorrect/10'
								}`}
							>
								{isSkipped ?
									<MinusCircle className="h-5 w-5 text-muted-foreground shrink-0" />
								: isCorrect ?
									<CheckCircle2 className="h-5 w-5 text-quiz-correct shrink-0" />
								:	<XCircle className="h-5 w-5 text-quiz-incorrect shrink-0" />}
								<span className="text-sm font-semibold text-foreground">Question {index + 1}</span>
								<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground ml-auto">
									{q.type === 'TRUE_FALSE' ? 'True / False' : 'MCQ'}
								</span>
							</div>

							{/* Question text */}
							<div className="px-4 pt-3 pb-2">
								<p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
							</div>

							{/* Options */}
							<div className="px-4 pb-4 space-y-2">
								{q.options?.map((option, i) => {
									const isUserChoice = userAnswer?.answer === option.id;
									const isCorrectOption = q.correctAnswer === option.id;
									const letter = String.fromCharCode(65 + i);

									let borderClass = 'border-border';
									let bgClass = '';
									let iconEl = null;

									if (isCorrectOption) {
										borderClass = 'border-quiz-correct';
										bgClass = 'bg-quiz-correct/8';
										iconEl = <CheckCircle2 className="h-4 w-4 text-quiz-correct shrink-0" />;
									} else if (isUserChoice && !isCorrect) {
										borderClass = 'border-quiz-incorrect';
										bgClass = 'bg-quiz-incorrect/8';
										iconEl = <XCircle className="h-4 w-4 text-quiz-incorrect shrink-0" />;
									}

									return (
										<div
											key={option.id}
											className={`flex items-center gap-3 rounded-lg border-2 p-3 ${borderClass} ${bgClass}`}
										>
											<span
												className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
													isCorrectOption ? 'bg-quiz-correct text-accent-foreground'
													: isUserChoice && !isCorrect ?
														'bg-quiz-incorrect text-destructive-foreground'
													:	'bg-secondary text-secondary-foreground'
												}`}
											>
												{letter}
											</span>
											<span className="text-sm text-foreground flex-1">{option.text}</span>
											{iconEl}
											{isUserChoice && (
												<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
