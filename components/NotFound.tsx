'use client';

// External (Next.js)
import { useRouter } from 'next/navigation';

// External Components
import { AlertTriangle } from 'lucide-react';

type NotFoundProps = {
	message: string;
	subtitle?: string;
	height?: 'full' | 'normal'; // restrict allowed values
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
			className={`w-full flex flex-col justify-center items-center ${containerClass} text-white bg-gray-900 gap-3`}
		>
			{/* Icon + Message */}
			<div className="flex flex-col justify-center items-center gap-2">
				{/* Icon */}
				{showIcon && <AlertTriangle className="w-10 h-10 text-yellow-400" />}

				{/* Message */}
				<div className="text-center text-lg font-semibold">{message}</div>

				{/* Subtitle (optional) */}
				{subtitle && (
					<div className="text-center text-sm text-gray-400 max-w-md leading-relaxed">
						{subtitle}
					</div>
				)}
			</div>

			{/* Optional Action Button */}
			{action !== 'none' && (
				<button
					onClick={actionBtnHandler}
					className="px-6 py-2 text-sm bg-transparent border border-amber-50 rounded-md transition shadow cursor-pointer hover:bg-blue-50 hover:text-gray-800 font-semibold"
				>
					{actionBtnLabel}
				</button>
			)}
		</div>
	);
}
