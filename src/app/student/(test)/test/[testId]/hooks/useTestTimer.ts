'use client';

import { useEffect, useRef, useState } from 'react';

type UseTestTimerParams = {
	initialSeconds: number;
	onExpire?: () => void | Promise<void>;
	isActive?: boolean;
};

export function useTestTimer(params: UseTestTimerParams) {
	const { initialSeconds, onExpire, isActive = true } = params;

	const [remainingSeconds, setRemainingSeconds] = useState<number>(Math.max(0, initialSeconds));
	const expiredRef = useRef(false);
	const startedRef = useRef(false);

	// Sync external initialSeconds changes (e.g. resume/new attempt load)
	useEffect(() => {
		// eslint-disable-next-line
		setRemainingSeconds(Math.max(0, initialSeconds));
		expiredRef.current = false;
		startedRef.current = false;
	}, [initialSeconds]);

	useEffect(() => {
		if (!isActive) return;
		if (initialSeconds <= 0) return; // no timer, avoid instant expiry
		if (remainingSeconds <= 0) return;

		startedRef.current = true;

		const interval = window.setInterval(() => {
			setRemainingSeconds((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => window.clearInterval(interval);
	}, [initialSeconds, isActive, remainingSeconds]);

	useEffect(() => {
		if (!isActive) return;
		if (remainingSeconds > 0) return;
		if (!startedRef.current) return; // only fire after a running countdown reaches 0
		if (expiredRef.current) return;

		expiredRef.current = true;
		void onExpire?.();
	}, [isActive, remainingSeconds, onExpire]);

	return { remainingSeconds, setRemainingSeconds };
}
