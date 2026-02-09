// app/not-found.tsx
// ✅
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-ab-bg p-4 text-center text-ab-text-primary">
			<div className="relative mb-6">
				{/* Soft glow background */}
				<div className="absolute -inset-6 rounded-full bg-ab-primary/20 blur-2xl" />

				<FileQuestion className="relative size-24 text-ab-primary" />
			</div>

			<h1 className="text-6xl font-bold tracking-tighter sm:text-7xl">404</h1>

			<h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Page Not Found</h2>

			<p className="mt-4 max-w-md text-ab-text-secondary">
				Oops! It looks like the chapter you are looking for doesn&apos;t exist or has been moved.
				Don&apos;t let this interrupt your preparation!
			</p>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<Button
					asChild
					size="lg"
					className="bg-ab-primary px-8 font-bold text-primary-foreground shadow-lg shadow-ab-primary/30 hover:bg-ab-primary/90"
				>
					<Link href="/dashboard">
						<Home className="mr-2 size-5" />
						BACK TO DASHBOARD
					</Link>
				</Button>

				<Button
					variant="outline"
					size="lg"
					className="border-ab-border bg-ab-surface font-bold text-ab-text-primary shadow-sm hover:bg-ab-primary-soft/10"
				>
					CONTACT SUPPORT
				</Button>
			</div>
		</div>
	);
}
