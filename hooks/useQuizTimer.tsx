import { useEffect, useState, useCallback } from 'react';

interface UseQuizTimerProps {
	totalSeconds: number;
	onTimeUp: () => void;
	isRunning: boolean;
	resetKey: number;
}

export function useQuizTimer({ totalSeconds, onTimeUp, isRunning, resetKey }: UseQuizTimerProps) {
	const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

	useEffect(() => {
		setSecondsLeft(totalSeconds);
	}, [resetKey, totalSeconds]);

	useEffect(() => {
		if (!isRunning) return;
		if (secondsLeft <= 0) {
			onTimeUp();
			return;
		}
		const interval = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [isRunning, secondsLeft, onTimeUp]);

	const elapsed = totalSeconds - secondsLeft;

	const formatTime = useCallback((secs: number) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}, []);

	const percentage = (secondsLeft / totalSeconds) * 100;

	return { secondsLeft, elapsed, formatTime, percentage };
}
