import { cn } from '@/lib/utils';
import React from 'react';

const badgeVariants = {
	green: 'bg-ab-green-bg text-ab-green-text',
	blue: 'bg-ab-blue-bg text-ab-blue-text',
	pink: 'bg-ab-pink-bg text-ab-pink-text',
	purple: 'bg-ab-purple-bg text-ab-purple-text'
};

interface StateBadgeProps {
	label: string;
	value: string | number;
	variant?: keyof typeof badgeVariants;
	className?: string;
}

export function StatBadge({ label, value, variant = 'blue', className }: StateBadgeProps) {
	return (
		<div
			className={cn(
				'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors',
				badgeVariants[variant],
				className
			)}
		>
			<span className="opacity-70 font-medium">{value}</span>
			<span>{label}</span>
		</div>
	);
}
