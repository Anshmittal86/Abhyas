import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
	return (
		<div className="bg-surface rounded-lg p-6">
			<h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
			<div className="space-y-3">
				<Link
					href="/tests"
					className="block w-full bg-accent-primary text-primary font-medium py-2 px-4 rounded-lg hover:opacity-90 text-center transition"
				>
					Take a Test
				</Link>
				<Link
					href="/courses"
					className="block w-full bg-surface border border-default text-primary font-medium py-2 px-4 rounded-lg hover:bg-main transition"
				>
					View Courses
				</Link>
				<Link
					href="/results"
					className="block w-full bg-surface border border-default text-primary font-medium py-2 px-4 rounded-lg hover:bg-main transition"
				>
					Check Results
				</Link>
			</div>
		</div>
	);
}
