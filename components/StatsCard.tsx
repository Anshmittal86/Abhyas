import React from 'react';

interface StatsCardProps {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	borderColor: 'accent-primary' | 'accent-success' | 'accent-warning' | 'accent-error';
	iconColor: 'accent-primary' | 'accent-success' | 'accent-warning' | 'accent-error';
}

export default function StatsCard({ label, value, icon, borderColor, iconColor }: StatsCardProps) {
	return (
		<div className={`bg-surface rounded-lg p-6 border-l-4 border-${borderColor}`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-muted text-sm font-medium mb-1">{label}</p>
					<p className="text-3xl font-bold text-primary">{value}</p>
				</div>
				<div className="bg-surface rounded-full p-3 border border-default">
					<div className={`text-${iconColor}`}>{icon}</div>
				</div>
			</div>
		</div>
	);
}
