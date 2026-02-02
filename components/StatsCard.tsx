import React from 'react';

interface StatsCardProps {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	borderColor: 'accent-primary' | 'accent-success' | 'accent-warning' | 'accent-error';
	iconColor: 'accent-primary' | 'accent-success' | 'accent-warning' | 'accent-error';
}

export default function StatsCard({ label, value, icon, borderColor }: StatsCardProps) {
	return (
		<div className="bg-surface rounded-xl p-5 border border-default flex items-center justify-between">
			<div>
				<p className="text-xs uppercase tracking-wide text-muted mb-1">{label}</p>
				<p className="text-2xl font-semibold text-primary">{value}</p>
			</div>

			<div
				className={`w-11 h-11 rounded-lg flex items-center justify-center bg-main text-${borderColor}`}
			>
				{icon}
			</div>
		</div>
	);
}
