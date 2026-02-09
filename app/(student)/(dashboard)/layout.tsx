import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar userRole="student" />
			<main className="w-full">
				<div className="p-2 md:p-4">
					<SidebarTrigger className="mb-2 md:mb-0" />
				</div>
				{children}
			</main>
		</SidebarProvider>
	);
}
