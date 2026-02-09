'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Moon } from 'lucide-react';
// ✅
export function Header() {
	return (
		<nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-ab-border/40 bg-ab-bg/80 px-6 backdrop-blur-md">
			{/* Left: Logo */}
			<div className="flex shrink-0 items-center gap-2">
				<div className="rounded-lg bg-ab-primary p-1.5">
					<GraduationCap className="size-6 text-primary-foreground" />
				</div>

				<span className="text-2xl font-black tracking-tighter text-ab-text-primary">
					Abyash
					<span className="ml-1 rounded-full border border-ab-primary/30 px-2 py-0.5 text-[10px] font-bold text-ab-primary">
						PORTAL
					</span>
				</span>
			</div>

			{/* Middle: Navigation */}
			<div className="hidden items-center gap-8 md:flex">
				<Link
					href="#courses"
					className="flex items-center gap-1.5 text-sm font-bold text-ab-text-secondary transition-colors hover:text-ab-text-primary"
				>
					Courses
				</Link>

				<Link
					href="#trending"
					className="flex items-center gap-1.5 text-sm font-bold text-ab-text-secondary transition-colors hover:text-ab-text-primary"
				>
					Trending
				</Link>

				<Link
					href="#offers"
					className="flex items-center gap-1.5 text-sm font-bold text-ab-text-secondary transition-colors hover:text-ab-text-primary"
				>
					Discounts
				</Link>

				<Link
					href="#features"
					className="flex items-center gap-1.5 text-sm font-bold text-ab-text-secondary transition-colors hover:text-ab-text-primary"
				>
					Features
				</Link>

				<Button
					variant="ghost"
					size="icon"
					className="rounded-xl text-ab-text-secondary transition-colors hover:bg-ab-primary/10 hover:text-ab-primary"
				>
					<Moon className="size-5" />
				</Button>
			</div>
		</nav>
	);
}
