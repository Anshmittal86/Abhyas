'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { QuizAnswer, QuizResult, QuizData } from '@/types/quiz';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { QuizTimer } from '@/components/student/quiz/QuizTimer';
import { QuizQuestionCard } from '@/components/student/quiz/QuizQuestionCard';
import { QuizNavigator } from '@/components/student/quiz/QuizNavigator';
import { QuizResults } from '@/components/student/quiz/QuizResult';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Send } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/apiFetch';

type QuizState = 'intro' | 'active' | 'results';

interface AttemptData {
	attemptId: string;
	testId: string;
	questions: QuizData['questions'];
	previousAnswers: Record<string, string>;
	answeredCount: number;
	totalQuestions: number;
	remainingSeconds: number;
	startedAt: string;
	expiresAt: string;
}

const TestPage = () => {
	const params = useParams();
	const router = useRouter();

	// The URL param is named testId but contains attemptId (due to TestCard routing)
	const attemptId = params.attemptId as string;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quizState, setQuizState] = useState<QuizState>('intro');
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
	const [result, setResult] = useState<QuizResult | null>(null);
	const [timerResetKey, setTimerResetKey] = useState(0);
	const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
	const [quiz, setQuiz] = useState<QuizData | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const submittingRef = useRef(false);
	const secondsLeftRef = useRef(0);

	useEffect(() => {
		const fetchAttemptData = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiFetch(`/api/student/attempt/${attemptId}/all-questions`);
				const result = await response.json();

				if (!result.success) {
					throw new Error(result.message || 'Failed to fetch attempt');
				}

				const data: AttemptData = result.data;
				setAttemptData(data);

				// Reconstruct quiz data from attempt data
				const quizData: QuizData = {
					id: data.testId,
					title: 'Test', // Will be fetched separately if needed
					description: '',
					timeLimit: data.remainingSeconds,
					questions: data.questions
				};

				setQuiz(quizData);

				// Load previous answers
				const previousAnswersMap = new Map<string, QuizAnswer>();
				Object.entries(data.previousAnswers).forEach(([questionId, optionId]) => {
					if (optionId) {
						previousAnswersMap.set(questionId, { questionId, answer: optionId });
					}
				});
				setAnswers(previousAnswersMap);
			} catch (err) {
				console.error('Error fetching attempt:', err);
				setError(err instanceof Error ? err.message : 'Failed to load test');
				toast.error('Failed to load test. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		if (attemptId) {
			fetchAttemptData();
		}
	}, [attemptId]);

	// Calculate result
	const calculateResult = useCallback(
		(elapsed: number) => {
			if (!quiz) return null;

			let correct = 0;
			let wrong = 0;
			let skipped = 0;

			quiz.questions.forEach((q) => {
				const ans = answers.get(q.id);
				if (!ans) {
					skipped++;
				} else if (ans.answer === q.correctAnswer) {
					correct++;
				} else {
					wrong++;
				}
			});

			return {
				totalQuestions: quiz.questions.length,
				answered: correct + wrong,
				correct,
				wrong,
				skipped,
				timeTaken: elapsed
			};
		},
		[answers, quiz]
	);

	// Submit quiz
	const submitQuiz = useCallback(
		(elapsedTime: number) => {
			const res = calculateResult(elapsedTime);
			if (res) {
				setResult(res);
				setQuizState('results');
			}
		},
		[calculateResult]
	);

	// Handle manual submission
	const handleSubmit = useCallback(async () => {
		if (!quiz || !attemptId || submittingRef.current) return;

		submittingRef.current = true;
		setSubmitting(true);

		try {
			// Calculate elapsed time
			const elapsedSeconds = quiz.timeLimit - secondsLeftRef.current;
			submitQuiz(elapsedSeconds);

			// Send submission to backend
			const submitResponse = await apiFetch(`/api/student/attempt/${attemptId}/submit`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!submitResponse.ok) {
				throw Error(`Error Submit Tests: ${submitResponse.statusText}`);
			}

			const submitResult = await submitResponse.json();

			if (!submitResult.success) {
				throw new Error(submitResult.message || 'Failed to submit test');
			}

			toast.success('Test submitted successfully!');
		} catch (err) {
			console.error('Error submitting test:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to submit test');
		} finally {
			submittingRef.current = false;
			setSubmitting(false);
		}
	}, [quiz, attemptId, submitQuiz]);

	// Handle time up (auto-submission)
	const handleTimeUp = useCallback(async () => {
		const correct =
			quiz?.questions.filter((q) => answers.get(q.id)?.answer === q.correctAnswer).length ?? 0;
		const answered = answers.size;

		setResult({
			totalQuestions: quiz?.questions.length ?? 0,
			answered,
			correct,
			wrong: answered - correct,
			skipped: (quiz?.questions.length ?? 0) - answered,
			timeTaken: quiz?.timeLimit ?? 0
		});

		setQuizState('results');

		// Auto-submit to backend
		if (attemptId) {
			try {
				const submitResponse = await apiFetch(`/api/student/attempt/${attemptId}/submit`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' }
				});

				const submitResult = await submitResponse.json();

				if (!submitResult.success) {
					console.error('Error auto-submitting test:', submitResult);
				}
			} catch (err) {
				console.error('Error auto-submitting test:', err);
			}
		}
	}, [quiz, answers, attemptId]);

	// Timer hook - using remaining seconds
	const { secondsLeft, formatTime, percentage } = useQuizTimer({
		totalSeconds: attemptData?.remainingSeconds ?? 0,
		onTimeUp: handleTimeUp,
		isRunning: quizState === 'active',
		resetKey: timerResetKey
	});

	secondsLeftRef.current = secondsLeft;

	// Handle answer
	const handleAnswer = (answer: QuizAnswer) => {
		setAnswers((prev) => new Map(prev).set(answer.questionId, answer));

		// Save answer to backend
		fetch(`/api/student/attempt/${attemptId}/answer`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				questionId: answer.questionId,
				selectedOption: answer.answer
			})
		}).catch((err) => console.error('Error saving answer:', err));
	};

	// Handle retry
	const handleRetry = () => {
		setAnswers(new Map());
		setCurrentIndex(0);
		setResult(null);
		setTimerResetKey((k) => k + 1);
		setQuizState('intro');
	};

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-ab-bg p-4">
				<Loader message="Loading test..." />
			</div>
		);
	}

	// Error state
	if (error || !quiz) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-ab-bg p-4">
				<div className="w-full max-w-md text-center">
					<div className="bg-ab-surface rounded-2xl border border-ab-border shadow-sm p-8">
						<h1 className="text-2xl font-black text-ab-text-primary mb-2">Error</h1>

						<p className="text-sm text-ab-text-secondary mb-6 font-medium">
							{error || 'Failed to load test'}
						</p>

						<Button
							onClick={() => router.push('/dashboard/tests')}
							className="w-full bg-ab-primary text-white hover:bg-ab-primary-soft font-bold"
						>
							Back to Tests
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const currentQuestion = quiz.questions[currentIndex];
	const answeredIds = new Set(answers.keys());

	// Intro screen
	if (quizState === 'intro') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-ab-bg p-4">
				<div className="w-full max-w-md text-center">
					<div className="bg-ab-surface rounded-2xl border border-ab-border shadow-sm p-8">
						<div className="w-16 h-16 rounded-2xl bg-ab-primary/10 flex items-center justify-center mx-auto mb-6">
							<Play className="h-7 w-7 text-ab-primary" />
						</div>

						<h1 className="text-2xl font-black text-ab-text-primary mb-2">Test</h1>

						<p className="text-sm text-ab-text-secondary mb-6 font-medium">
							{quiz.description || 'Answer all questions within the time limit.'}
						</p>

						<div className="flex justify-center gap-6 mb-6 text-sm text-ab-text-secondary">
							<div>
								<span className="font-black text-ab-text-primary">{quiz.questions.length}</span>{' '}
								Questions
							</div>

							<div>
								<span className="font-black text-ab-text-primary">
									{Math.floor((attemptData?.remainingSeconds ?? 0) / 60)}:
									{((attemptData?.remainingSeconds ?? 0) % 60).toString().padStart(2, '0')}
								</span>{' '}
								min
							</div>
						</div>

						{answers.size > 0 && (
							<p className="text-xs mb-4 bg-ab-purple-bg text-ab-purple-text rounded-lg py-2 px-3 font-medium">
								You have {answers.size} answer(s) saved. Continue from where you left off.
							</p>
						)}

						<Button
							onClick={() => setQuizState('active')}
							className="w-full gap-2 bg-ab-primary text-white hover:bg-ab-primary-soft font-bold"
							size="lg"
						>
							<Play className="h-4 w-4" />
							{answers.size > 0 ? 'Resume Test' : 'Start Test'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Results screen
	if (quizState === 'results' && result) {
		return (
			<QuizResults
				result={result}
				questions={quiz.questions}
				answers={answers}
				onRetry={handleRetry}
			/>
		);
	}

	// Active quiz
	return (
		<div className="min-h-screen bg-ab-bg text-ab-text-primary flex flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 bg-ab-surface border-b border-ab-border px-4 py-3 backdrop-blur">
				<div className="max-w-3xl mx-auto flex items-center justify-between">
					<h1 className="text-sm font-semibold text-ab-text-primary truncate">Test</h1>

					<QuizTimer secondsLeft={secondsLeft} percentage={percentage} formatTime={formatTime} />
				</div>

				{/* Progress bar */}
				<div className="max-w-3xl mx-auto mt-2">
					<div className="w-full h-1.5 rounded-full bg-ab-border overflow-hidden">
						<div
							className="h-full rounded-full bg-ab-primary transition-all duration-300"
							style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
						/>
					</div>
				</div>
			</header>

			{/* Question area */}
			<main className="flex-1 flex items-center justify-center p-4 py-8">
				<QuizQuestionCard
					question={currentQuestion}
					questionNumber={currentIndex + 1}
					totalQuestions={quiz.questions.length}
					currentAnswer={answers.get(currentQuestion.id)}
					onAnswer={handleAnswer}
				/>
			</main>

			{/* Footer */}
			<footer className="sticky bottom-0 bg-ab-surface border-t border-ab-border px-4 py-4">
				<div className="max-w-3xl mx-auto space-y-4">
					<QuizNavigator
						totalQuestions={quiz.questions.length}
						currentIndex={currentIndex}
						answeredIds={answeredIds}
						questionIds={quiz.questions.map((q) => q.id)}
						onNavigate={setCurrentIndex}
					/>

					<div className="flex items-center justify-between">
						<Button
							variant="outline"
							onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
							disabled={currentIndex === 0}
							className="gap-1 border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>

						{currentIndex === quiz.questions.length - 1 ?
							<Button
								onClick={handleSubmit}
								disabled={submitting}
								className="gap-1 bg-ab-primary text-ab-text-primary hover:bg-ab-primary-soft"
							>
								<Send className="h-4 w-4" />
								{submitting ? 'Submitting...' : 'Submit Test'}
							</Button>
						:	<Button
								onClick={() => setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
								className="gap-1 bg-ab-primary text-ab-text-primary hover:bg-ab-primary-soft"
							>
								Next
								<ChevronRight className="h-4 w-4" />
							</Button>
						}
					</div>
				</div>
			</footer>
		</div>
	);
};

export default TestPage;
