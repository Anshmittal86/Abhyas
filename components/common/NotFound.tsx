'use client';
// ✅
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

type NotFoundProps = {
	message: string;
	subtitle?: string;
	height?: 'full' | 'normal';
	showIcon?: boolean;
	action?: 'retry' | 'back' | 'dashboard' | 'none';
};

export default function NotFound({
	message,
	subtitle,
	height = 'full',
	showIcon = true,
	action = 'none'
}: NotFoundProps) {
	const router = useRouter();
	const containerClass = height === 'full' ? 'min-h-screen' : 'h-[150px]';

	let actionBtnLabel = '';
	let actionBtnHandler = () => {};

	switch (action) {
		case 'retry':
			actionBtnLabel = 'Retry';
			actionBtnHandler = () => window.location.reload();
			break;
		case 'back':
			actionBtnLabel = 'Go Back';
			actionBtnHandler = () => router.back();
			break;
		case 'dashboard':
			actionBtnLabel = 'Go to Dashboard';
			actionBtnHandler = () => router.push('/admin/certificates');
			break;
	}

	return (
		<div
			className={`flex w-full flex-col items-center justify-center gap-3 ${containerClass} bg-ab-bg text-ab-text-primary`}
		>
			{/* Icon + Message */}
			<div className="flex flex-col items-center justify-center gap-2">
				{showIcon && <AlertTriangle className="h-10 w-10 text-ab-primary" />}

				<div className="text-center text-lg font-semibold">{message}</div>

				{subtitle && (
					<div className="max-w-md text-center text-sm leading-relaxed text-ab-text-secondary">
						{subtitle}
					</div>
				)}
			</div>

			{/* Optional Action */}
			{action !== 'none' && (
				<button
					onClick={actionBtnHandler}
					className="cursor-pointer rounded-md border border-ab-border/80 bg-ab-surface px-6 py-2 text-sm font-semibold text-ab-text-primary shadow-sm transition hover:border-ab-primary/40 hover:bg-ab-primary/5"
				>
					{actionBtnLabel}
				</button>
			)}
		</div>
	);
}
