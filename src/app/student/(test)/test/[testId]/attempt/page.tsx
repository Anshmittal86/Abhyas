'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

import TestHeader from '../components/TestHeader';
import QuestionCard from '../components/QuestionCard';
import OptionsList from '../components/OptionsList';
import ProgressBar from '../components/ProgressBar';
import QuestionNavigator from '../components/QuestionNavigator';
import TestFooter from '../components/TestFooter';
import { useTestTimer } from '../hooks/useTestTimer';

type AttemptQuestion = {
	id: string;
	text: string;
	options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
};

export default function TestPage() {
	const { testId } = useParams();
	const router = useRouter();

	const [attemptId, setAttemptId] = useState<string | null>(null);
	const [question, setQuestion] = useState<AttemptQuestion | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answeredCount, setAnsweredCount] = useState(0);
	const [totalQuestions, setTotalQuestions] = useState(0);
	const [initialSeconds, setInitialSeconds] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const redirectToResult = useCallback(
		(id: string) => {
		router.replace(`/student/results/${id}`);
		},
		[router]
	);

	const fetchAttemptState = useCallback(async (id: string, index?: number) => {
		const url =
			index !== undefined ?
				`/api/student/attempt/${id}?index=${index}`
			:	`/api/student/attempt/${id}`;

		const res = await apiFetch(url, { method: 'GET' });
		if (!res.ok) throw new Error();

		const result = await res.json();

		setQuestion(result.data.question);
		setCurrentIndex(result.data.currentIndex);
		setAnsweredCount(result.data.answeredCount ?? 0);
		setTotalQuestions(result.data.totalQuestions);
		setInitialSeconds(result.data.remainingSeconds);
	}, []);

	const submitAttempt = useCallback(async () => {
		if (!attemptId || submitting) return;
		setSubmitting(true);
		try {
			const res = await apiFetch(`/api/student/attempt/${attemptId}/submit`, { method: 'PUT' });
			if (!res.ok) throw new Error();
			const result = await res.json();
			redirectToResult(result.data.testId ?? String(testId));
		} catch (e) {
			console.error('Submit failed', e);
		} finally {
			setSubmitting(false);
		}
	}, [attemptId, redirectToResult, submitting, testId]);

	const { remainingSeconds } = useTestTimer({
		initialSeconds,
		isActive: Boolean(attemptId) && !loading && !submitting,
		onExpire: submitAttempt
	});

	useEffect(() => {
		let isMounted = true;
		const loadAttempt = async () => {
			try {
				setLoading(true);
				setError(false);

				if (!isMounted) return;

				// Rule 1/2: start endpoint resumes IN_PROGRESS else creates new attempt
				const startRes = await apiFetch(`/api/student/tests/${testId}/start`, { method: 'POST' });
				if (!startRes.ok) throw new Error();
				const startResult = await startRes.json();

				const newAttemptId = startResult?.data?.attemptId as string | undefined;
				if (!newAttemptId) throw new Error();

				if (!isMounted) return;
				setAttemptId(newAttemptId);
				await fetchAttemptState(newAttemptId);
			} catch {
				if (isMounted) setError(true);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		if (testId) loadAttempt();
		return () => {
			isMounted = false;
		};
	}, [fetchAttemptState, testId]);

	if (loading) return <div className="p-8">Loading test…</div>;
	if (error) return <div className="p-8 text-error">Unable to load test</div>;
	if (!question || !attemptId) return null;

	return (
		<div className="flex-1 flex flex-col px-8 py-6 space-y-6">
			<TestHeader remainingSeconds={remainingSeconds} />

			<div className="bg-surface border border-default rounded-xl p-6 space-y-6">
				<ProgressBar currentIndex={currentIndex} totalQuestions={totalQuestions} />
				<QuestionCard question={question} />
				<OptionsList attemptId={attemptId} question={question} />
				<QuestionNavigator totalQuestions={totalQuestions} answeredCount={answeredCount} />
			</div>

			<TestFooter
				onPrev={() => {
					if (!attemptId) return;
					const prevIndex = Math.max(0, currentIndex - 1);
					if (prevIndex === currentIndex) return;
					setCurrentIndex(prevIndex);
					void fetchAttemptState(attemptId, prevIndex);
				}}
				onNext={() => {
					if (!attemptId) return;
					const nextIndex = Math.min(totalQuestions - 1, currentIndex + 1);
					if (nextIndex === currentIndex) return;
					setCurrentIndex(nextIndex);
					void fetchAttemptState(attemptId, nextIndex);
				}}
				onSubmit={submitAttempt}
				submitting={submitting}
			/>
		</div>
	);
}
