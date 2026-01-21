import React from 'react';

interface LoadingStateProps {
	message?: string;
}

export default function LoadingState({ message = 'Loading your dashboard...' }: LoadingStateProps) {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center">
				<div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-secondary">{message}</p>
			</div>
		</div>
	);
}
