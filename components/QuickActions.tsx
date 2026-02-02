import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
	return (
		<div className="bg-surface rounded-xl p-6">
			<h3 className="text-lg font-medium text-primary mb-5">Quick Actions</h3>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Link href="/tests" className="action-card bg-accent-primary">
					Take a Test
				</Link>
				<Link href="/courses" className="action-card">
					View Courses
				</Link>
				<Link href="/results" className="action-card">
					Check Results
				</Link>
			</div>
		</div>
	);
}

// .action-card {
// 	@apply rounded-lg py-3 text-center font-medium border border-default bg-main text-primary hover:bg-surface transition;
// }
