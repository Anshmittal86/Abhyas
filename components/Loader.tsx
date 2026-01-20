import { Loader2 } from 'lucide-react';

type LoaderProps = {
	size?: number;
	height?: 'full' | 'normal' | 'auto';
	showIcon?: boolean;
	message?: string;
	subtitle?: string;
};

export default function Loader({
	size = 25,
	height = 'normal',
	showIcon = true,
	message,
	subtitle
}: LoaderProps) {
	// height prop: "normal" OR "full"

	const containerClass =
		height === 'full' ? 'min-h-screen'
		: height === 'normal' ? 'h-[120px]'
		: ''; // auto height

	return (
		<div className={`flex flex-col justify-center items-center ${containerClass} gap-3 p-4`}>
			{/* Loader Icon */}
			{showIcon && <Loader2 size={size} className="animate-spin text-white" />}

			{/* Optional Message */}
			{message && <div className="text-white text-base font-medium text-center">{message}</div>}

			{/* Optional Subtitle */}
			{subtitle && (
				<div className="text-gray-400 text-sm text-center max-w-md leading-relaxed">{subtitle}</div>
			)}
		</div>
	);
}
