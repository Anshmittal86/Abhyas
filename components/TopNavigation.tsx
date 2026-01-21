import React from 'react';

interface TopNavigationProps {
	onMenuToggle: () => void;
}

export default function TopNavigation({ onMenuToggle }: TopNavigationProps) {
	return (
		<nav className="bg-surface border-b border-default">
			<div className="px-4 py-3 flex items-center justify-between">
				<button
					onClick={onMenuToggle}
					className="inline-flex sm:hidden p-2 text-secondary hover:bg-main rounded-lg transition"
					aria-label="Toggle sidebar"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<h2 className="text-lg font-semibold text-primary">Welcome to Your Dashboard</h2>
				<div className="w-8 h-8" />
			</div>
		</nav>
	);
}
