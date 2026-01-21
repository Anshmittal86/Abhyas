import React from 'react';

interface ErrorStateProps {
	onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
	return (
		<div className="text-center py-12">
			<p className="text-secondary mb-4">Unable to load dashboard data</p>
			<button
				onClick={onRetry}
				className="bg-accent-primary text-primary px-4 py-2 rounded-lg hover:opacity-90 transition"
			>
				Try Again
			</button>
		</div>
	);
}
