'use client';
// ✅
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenuButton,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarGroupContent,
	useSidebar
} from '@/components/ui/sidebar';
import { LogOut, Moon, Sun, Circle, EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MENU_DATA } from '@/lib/menu-items';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface AppSidebarProps {
	userRole: 'student' | 'admin';
}

export function AppSidebar({ userRole = 'admin' }: AppSidebarProps) {
	const { isMobile } = useSidebar();
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [detectedRole, setDetectedRole] = useState<'admin' | 'student' | null>(null);
	const [detectedProvisional, setDetectedProvisional] = useState<string | null>(null);

	// detect user from server-side cookie via API
	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const res = await fetch('/api/auth/me', { credentials: 'include' });
				if (!res.ok) return;
				const json = await res.json();
				if (!mounted) return;
				if (json.role === 'admin') setDetectedRole('admin');
				if (json.role === 'student') setDetectedRole('student');
				if (json.provisionalNo) setDetectedProvisional(json.provisionalNo as string);
			} catch {
				// ignore — fallback to prop
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, []);

	// prefer detected role; fall back to incoming prop
	const effectiveRole = detectedRole || userRole;
	const navItems = MENU_DATA[effectiveRole] || [];

	return (
		<Sidebar collapsible="icon" className="bg-ab-bg">
			<SidebarHeader className="overflow-hidden px-2 py-4 bg-ab-bg">
				<SidebarMenuButton size="lg" className="w-full cursor-default gap-3 hover:bg-transparent">
					<Circle className="ml-2 size-6 shrink-0 fill-current text-ab-text-primary" />
					<div className="flex flex-col">
						<span className="flex items-center gap-2 text-xl font-bold tracking-tight">
							Abyash
							{userRole === 'admin' && (
								<span className="rounded bg-ab-primary px-1.5 py-0.5 text-[10px] font-black uppercase text-primary-foreground">
									ADMIN
								</span>
							)}
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent className="bg-ab-bg">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive =
									pathname === item.url ||
									(item.url !== '/dashboard' && pathname.startsWith(item.url));

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											tooltip={item.title}
											className={cn(
												'h-11 transition-all duration-200',
												isActive ?
													'bg-ab-primary/10 font-bold text-ab-primary'
												:	'text-ab-text-secondary hover:bg-sidebar-accent hover:text-ab-text-primary',
												item.isComingSoon && 'cursor-not-allowed opacity-60'
											)}
										>
											{item.isComingSoon ?
												<div className="flex w-full items-center px-2">
													<item.icon className="size-5 shrink-0" />
													<span className="ml-3 truncate text-md">{item.title}</span>
													<Badge
														variant="secondary"
														className="ml-auto h-4 border-none bg-ab-border/20 px-1 py-0 text-[9px] font-bold uppercase text-ab-text-secondary"
													>
														Soon
													</Badge>
												</div>
											:	<Link href={item.url} className="flex w-full items-center">
													<item.icon
														className={cn('size-5 shrink-0', isActive && 'text-ab-primary')}
													/>
													<span className="ml-3 truncate text-md">{item.title}</span>
												</Link>
											}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="overflow-hidden border-t border-dashed border-ab-border/80 px-2 py-4 bg-ab-bg">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="h-14 cursor-pointer rounded-2xl border-2 border-transparent data-[state=open]:bg-sidebar-accent hover:border-sidebar-border"
								>
									<Avatar className="h-9 w-9 rounded-xl border border-ab-border/80">
										<AvatarImage src="https://github.com/shadcn.png" alt="Ansh Mittal" />
										<AvatarFallback className="rounded-xl bg-ab-primary/10 font-bold text-ab-primary">
											AM
										</AvatarFallback>
									</Avatar>

									<div className="ml-2 grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-bold">Ansh Mittal</span>
										<span className="truncate text-[10px] font-medium leading-none text-ab-text-secondary">
											anshmit657@gmail.com
										</span>
									</div>

									<EllipsisVertical className="ml-auto size-4 opacity-50" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								className="w-64 rounded-2xl border-2 border-ab-border/80 p-2 shadow-xl bg-ab-bg"
								side={isMobile ? 'bottom' : 'right'}
								align="end"
								sideOffset={12}
							>
								<DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
									Provisional No: ST001
								</DropdownMenuLabel>

								<DropdownMenuSeparator className="bg-ab-border/80" />

								<DropdownMenuGroup>
									<DropdownMenuItem className="cursor-pointer rounded-lg py-2 font-medium">
										My Profile
									</DropdownMenuItem>

									<DropdownMenuItem
										className="flex cursor-pointer justify-between rounded-lg py-2 font-medium"
										onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
									>
										<span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
										{theme === 'dark' ?
											<Sun className="size-4" />
										:	<Moon className="size-4" />}
									</DropdownMenuItem>
								</DropdownMenuGroup>

								<DropdownMenuSeparator className="bg-ab-border/80" />

								<DropdownMenuItem
									className="cursor-pointer rounded-lg py-2 font-bold text-destructive transition-colors focus:bg-destructive/10 focus:text-destructive"
									onClick={async () => {
										// logout flow: POST to API (cookies included) -> redirect to login
										setIsLoggingOut(true);
										try {
											const res = await fetch('/api/auth/logout', {
												method: 'POST',
												credentials: 'include'
											});
											if (res.ok) {
												const json = await res.json().catch(() => ({}));
												toast.success(json?.message || 'Logged out');
												// use Next.js router.replace to replace history and avoid back navigation
												const loginPath = userRole === 'admin' ? '/admin/login' : '/login';
												router.replace(loginPath);
											} else {
												const err = await res.json().catch(() => ({}));
												toast.error(err?.message || 'Failed to logout');
											}
										} catch (err) {
											toast.error(err instanceof Error ? err.message : 'Logout failed');
										} finally {
											setIsLoggingOut(false);
										}
									}}
								>
									{isLoggingOut ?
										<span className="flex items-center">
											<LogOut className="mr-2 size-4 animate-spin" />
											Logging out...
										</span>
									:	<>
											<LogOut className="mr-2 size-4" />
											Log out
										</>
									}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
