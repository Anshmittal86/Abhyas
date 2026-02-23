'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Mail } from 'lucide-react';

export default function NotFound() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleDashboardClick = async () => {
		setIsLoading(true);
		try {
			// Fetch user info to determine role
			const response = await fetch('/api/auth/me', {
				method: 'GET',
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				const dashboardUrl = data.role === 'admin' ? '/admin/dashboard' : '/dashboard';
				router.push(dashboardUrl);
			} else {
				// If not authenticated, redirect to login or public dashboard
				router.push('/dashboard');
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
			// Fallback to student dashboard
			router.push('/dashboard');
		} finally {
			setIsLoading(false);
		}
	};

	const handleContactSupport = () => {
		window.location.href =
			'mailto:hello@techmastersedu.in?subject=Support Request&body=Hi,\n\nI need help with...';
	};

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
					onClick={handleDashboardClick}
					disabled={isLoading}
					size="lg"
					className="bg-ab-primary px-8 font-bold text-primary-foreground shadow-lg shadow-ab-primary/30 hover:bg-ab-primary/90 disabled:opacity-50"
				>
					<Home className="mr-2 size-5" />
					{isLoading ? 'LOADING...' : 'BACK TO DASHBOARD'}
				</Button>

				<Button
					onClick={handleContactSupport}
					variant="outline"
					size="lg"
					className="border-ab-border bg-ab-surface font-bold text-ab-text-primary shadow-sm hover:bg-ab-primary-soft/10"
				>
					<Mail className="mr-2 size-5" />
					CONTACT SUPPORT
				</Button>
			</div>
		</div>
	);
}
