'use client';

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
	userRole?: 'student' | 'admin';
}

interface UserData {
	id?: string;
	name?: string;
	email?: string;
	provisionalNo?: string;
	role?: 'admin' | 'student';
	avatarUrl?: string;
}

export function AppSidebar({ userRole = 'student' }: AppSidebarProps) {
	const { isMobile } = useSidebar();
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [user, setUser] = useState<UserData | null>(null);
	const [loadingUser, setLoadingUser] = useState(true);

	// Fetch real user data
	useEffect(() => {
		let mounted = true;

		const loadUser = async () => {
			try {
				const res = await fetch('/api/auth/me', { credentials: 'include' });
				if (!res.ok) throw new Error('Unauthorized');

				const json = await res.json();
				if (!mounted) return;

				setUser({
					name: json.name,
					email: json.email,
					provisionalNo: json.provisionalNo,
					role: json.role
				});
			} catch (err) {
				console.warn('Failed to fetch user, using fallback');
				setUser({ role: userRole });
			} finally {
				if (mounted) setLoadingUser(false);
			}
		};

		loadUser();

		return () => {
			mounted = false;
		};
	}, [userRole]);

	const effectiveRole = user?.role || userRole;
	const navItems = MENU_DATA[effectiveRole] || [];

	const getInitials = (name?: string) => {
		if (!name) return effectiveRole === 'admin' ? 'AD' : 'ST';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Sidebar collapsible="icon" className="bg-ab-bg">
			<SidebarHeader className="overflow-hidden px-2 py-4 bg-ab-bg">
				<SidebarMenuButton size="lg" className="w-full cursor-default gap-3 hover:bg-transparent">
					<Circle className="ml-2 size-6 shrink-0 fill-current text-ab-text-primary" />
					<div className="flex flex-col">
						<span className="flex items-center gap-2 text-xl font-bold tracking-tight">
							Abyash
							<span className="rounded-md text-[12px] bg-ab-primary border border-ab-border/80 px-1.5 py-0.5 text-white bg-ab-bg-primary/90 font-semibold tracking-normal">
								Beta
							</span>
							{effectiveRole === 'admin' && (
								<span className="rounded bg-ab-primary px-1.5 py-0.5 text-[10px] font-black uppercase text-primary-foreground bg-ab-bg-primary/90 tracking-wide">
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

			{/* ==================== SHIMMER FOOTER ==================== */}
			<SidebarFooter className="overflow-hidden border-t border-dashed border-ab-border/80 px-2 py-4 bg-ab-bg">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="h-14 cursor-pointer rounded-2xl border-2 border-transparent data-[state=open]:bg-sidebar-accent hover:border-sidebar-border"
									disabled={loadingUser}
								>
									{
										loadingUser ?
											// ✨ Shimmer Effect
											<div className="flex w-full items-center gap-3">
												<div className="h-9 w-9 rounded-xl bg-ab-border animate-pulse" />
												<div className="flex-1 space-y-2">
													<div className="h-4 w-28 rounded bg-ab-border animate-pulse" />
													<div className="h-3 w-40 rounded bg-ab-border animate-pulse" />
												</div>
											</div>
											// Real User Info
										:	<>
												<Avatar className="h-9 w-9 rounded-xl border border-ab-border/80">
													<AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
													<AvatarFallback className="rounded-xl bg-ab-primary/10 font-bold text-ab-primary">
														{getInitials(user?.name)}
													</AvatarFallback>
												</Avatar>

												<div className="ml-2 grid flex-1 text-left text-sm leading-tight">
													<span className="truncate font-bold">{user?.name || 'Student'}</span>
													<span className="truncate text-[10px] font-medium leading-none text-ab-text-secondary">
														{user?.email || 'user@abyash.com'}
													</span>
												</div>

												<EllipsisVertical className="ml-auto size-4 opacity-50" />
											</>

									}
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							{/* Dropdown content remains same (only shows when loaded) */}
							{!loadingUser && (
								<DropdownMenuContent
									className="w-64 rounded-2xl border-2 border-ab-border p-2 shadow-xl bg-ab-bg"
									side={isMobile ? 'bottom' : 'right'}
									align="end"
									sideOffset={12}
								>
									<DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
										Provisional No: {user?.provisionalNo || '—'}
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
											setIsLoggingOut(true);
											try {
												const res = await fetch('/api/auth/logout', {
													method: 'POST',
													credentials: 'include'
												});
												if (res.ok) {
													toast.success('Logged out successfully');
													const loginPath = effectiveRole === 'admin' ? '/admin/login' : '/login';
													router.replace(loginPath);
												} else {
													toast.error('Logout failed');
												}
											} catch (err) {
												toast.error('Logout failed');
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
							)}
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
