// ---------
'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavigation from '@/components/TopNavigation';

type Role = 'student' | 'admin';

export default function DashboardLayout({
	children,
	role
}: {
	children: React.ReactNode;
	role: Role;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex h-screen bg-main">
			{/* Sidebar */}
			<DashboardSidebar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} role={role} />

			<div className="flex-1 sm:ml-64 flex flex-col">
				{/* Top Navigation */}
				<TopNavigation onMenuToggle={() => setSidebarOpen(!sidebarOpen)} role={role} />

				{/* Page Content */}
				<main className="flex-1 overflow-auto">{children}</main>
			</div>
		</div>
	);
}
