import { Loader2 } from 'lucide-react';
// ✅
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
	const containerClass =
		height === 'full' ? 'min-h-screen'
		: height === 'normal' ? 'h-[120px]'
		: '';

	return (
		<div className={`flex flex-col items-center justify-center gap-3 p-4 ${containerClass}`}>
			{/* Loader Icon */}
			{showIcon && <Loader2 size={size} className="animate-spin text-ab-primary" />}

			{/* Optional Message */}
			{message && (
				<div className="text-center text-base font-medium text-ab-text-primary">{message}</div>
			)}

			{/* Optional Subtitle */}
			{subtitle && (
				<div className="max-w-md text-center text-sm leading-relaxed text-ab-text-secondary">
					{subtitle}
				</div>
			)}
		</div>
	);
}
