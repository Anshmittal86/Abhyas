import React from 'react';

type Role = 'student' | 'admin';

interface TopNavigationProps {
	onMenuToggle: () => void;
	role: Role;
}

export default function TopNavigation({ onMenuToggle, role }: TopNavigationProps) {
	return (
		<nav className="bg-surface border-b border-default px-6 h-14 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<button
					onClick={onMenuToggle}
					className="sm:hidden text-secondary"
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

				<h2 className="text-lg font-semibold text-primary">
					{role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
				</h2>
			</div>

			{/* Right side placeholder (future use) */}
			<div className="w-8 h-8" />
		</nav>
	);
}
