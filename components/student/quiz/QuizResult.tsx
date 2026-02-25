import { Question, QuizAnswer, QuizResult } from '@/types/quiz';
import { CheckCircle2, XCircle, MinusCircle, Clock, RotateCcw, Eye, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizReviewList } from './QuizReviewList';

interface QuizResultsProps {
	result: QuizResult;
	questions: Question[];
	answers: Map<string, QuizAnswer>;
	onRetry: () => void;
}

export function QuizResults({ result, questions, answers, onRetry }: QuizResultsProps) {
	const [showReview, setShowReview] = useState(false);
	const router = useRouter();
	const scorePercent = Math.round((result.correct / result.totalQuestions) * 100);
	const minutes = Math.floor(result.timeTaken / 60);
	const seconds = result.timeTaken % 60;

	if (showReview) {
		return (
			<QuizReviewList
				questions={questions}
				answers={answers}
				onBack={() => setShowReview(false)}
				onRetry={onRetry}
			/>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-ab-bg p-4">
			<div className="w-full max-w-md">
				<div className="bg-ab-surface rounded-2xl border border-ab-border shadow-sm p-8 text-center">
					{/* Score circle */}
					<div className="relative w-32 h-32 mx-auto mb-6">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
							<circle
								cx="60"
								cy="60"
								r="52"
								fill="none"
								stroke="var(--ab-border)"
								strokeWidth="8"
							/>
							<circle
								cx="60"
								cy="60"
								r="52"
								fill="none"
								stroke={scorePercent >= 50 ? 'var(--ab-green-text)' : 'var(--ab-pink-text)'}
								strokeWidth="8"
								strokeLinecap="round"
								strokeDasharray={`${(scorePercent / 100) * 327} 327`}
								className="transition-all duration-1000 ease-out"
							/>
						</svg>

						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="text-3xl font-extrabold text-ab-text-primary">{scorePercent}%</span>
							<span className="text-xs text-ab-text-secondary">Score</span>
						</div>
					</div>

					<h2 className="text-2xl font-black text-ab-text-primary mb-1">
						{scorePercent >= 80 ?
							'Excellent!'
						: scorePercent >= 50 ?
							'Good Job!'
						:	'Keep Trying!'}
					</h2>

					<p className="text-sm text-ab-text-secondary mb-6 font-medium">
						You answered {result.correct} out of {result.totalQuestions} correctly
					</p>

					{/* Stats */}
					<div className="grid grid-cols-2 gap-3 mb-6">
						<div className="flex items-center gap-2 bg-ab-green-bg rounded-lg p-3">
							<CheckCircle2 className="h-4 w-4 text-ab-green-text" />
							<div className="text-left">
								<p className="text-xs text-ab-text-secondary">Correct</p>
								<p className="text-sm font-black text-ab-text-primary">{result.correct}</p>
							</div>
						</div>

						<div className="flex items-center gap-2 bg-ab-pink-bg rounded-lg p-3">
							<XCircle className="h-4 w-4 text-ab-pink-text" />
							<div className="text-left">
								<p className="text-xs text-ab-text-secondary">Wrong</p>
								<p className="text-sm font-black text-ab-text-primary">{result.wrong}</p>
							</div>
						</div>

						<div className="flex items-center gap-2 bg-ab-border/30 rounded-lg p-3">
							<MinusCircle className="h-4 w-4 text-ab-text-secondary" />
							<div className="text-left">
								<p className="text-xs text-ab-text-secondary">Skipped</p>
								<p className="text-sm font-black text-ab-text-primary">{result.skipped}</p>
							</div>
						</div>

						<div className="flex items-center gap-2 bg-ab-blue-bg rounded-lg p-3">
							<Clock className="h-4 w-4 text-ab-blue-text" />
							<div className="text-left">
								<p className="text-xs text-ab-text-secondary">Time</p>
								<p className="text-sm font-black text-ab-text-primary">
									{minutes}m {seconds}s
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Button
							onClick={() => setShowReview(true)}
							variant="outline"
							className="w-full gap-2 border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
						>
							<Eye className="h-4 w-4" />
							Review Answers
						</Button>

						<Button
							onClick={onRetry}
							className="w-full gap-2 bg-ab-primary text-white hover:bg-ab-primary-soft font-bold"
						>
							<RotateCcw className="h-4 w-4" />
							Retry Quiz
						</Button>

						<Button
							onClick={() => router.push('/results')}
							className="w-full gap-2 border border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
							variant="outline"
						>
							<Home className="h-4 w-4" />
							View All Results
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
