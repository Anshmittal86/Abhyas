'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
	onRetry: () => void;
	message?: string;
};

export default function ErrorState({ onRetry, message = 'An error occurred' }: Props) {
	return (
		<div className="flex items-center justify-center min-h-100">
			<div className="text-center space-y-4 max-w-md">
				<div className="flex justify-center">
					<AlertTriangle className="h-12 w-12 text-red-500" />
				</div>
				<h2 className="text-lg font-semibold text-primary">{message}</h2>
				<p className="text-sm text-secondary">
					Something went wrong. Please try again or contact support if the problem persists.
				</p>
				<Button onClick={onRetry} variant="default" className="w-full gap-2">
					<RotateCcw className="h-4 w-4" />
					Try Again
				</Button>
			</div>
		</div>
	);
}
