'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, Bookmark, Clock, ClipboardList, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

type TestStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

interface TestCardProps {
	testId: string;
	attemptId?: string;
	title: string;
	course: string;
	unit: string;
	maxMarks: number;
	questions?: number;
	duration?: string;
	status?: TestStatus;
	timeRemaining?: string;
	gainedMarks?: number;
	attemptDate?: string;
	className?: string;
}

const statusConfig: Record<
	TestStatus,
	{
		label: string;
		bg: string;
		text: string;
		icon: React.ReactNode;
	}
> = {
	NEW: {
		label: 'Ready to Start',
		bg: 'bg-ab-blue-bg',
		text: 'text-ab-blue-text',
		icon: <Clock className="size-3.5" />
	},
	IN_PROGRESS: {
		label: 'In Progress',
		bg: 'bg-ab-purple-bg',
		text: 'text-ab-purple-text',
		icon: <Clock className="size-3.5 animate-pulse" />
	},
	COMPLETED: {
		label: 'Completed',
		bg: 'bg-ab-green-bg',
		text: 'text-ab-green-text',
		icon: <CheckCircle2 className="size-3.5" />
	}
};

export function TestCard({
	testId,
	attemptId,
	title,
	course,
	unit,
	maxMarks,
	questions,
	duration,
	status = 'NEW',
	timeRemaining,
	gainedMarks = 0,
	attemptDate,
	className
}: TestCardProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const percentage = maxMarks > 0 ? Math.round((gainedMarks / maxMarks) * 100) : 0;

	const formatDate = (dateString?: string): string => {
		if (!dateString) return '—';
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	const handleStartOrRetake = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/student/tests/${testId}/start`, {
				method: 'POST'
			});
			const data = await res.json();

			if (data.success) {
				router.push(`/test/active/${data.data.attemptId}`);
			} else {
				toast.error(data.message || 'Failed to start test');
			}
		} catch (error) {
			toast.error('An error occurred while starting the test');
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResumeTest = () => {
		if (attemptId) {
			router.push(`/test/active/${attemptId}`);
		} else {
			toast.error('No active attempt found');
		}
	};

	const handleViewResult = () => {
		// TODO: Ideally pass attemptId → `/results/${attemptId}`
		// for now keeping your original route
		router.push('/results');
	};

	const config = statusConfig[status];

	return (
		<div
			className={cn(
				'group relative flex flex-col gap-6 rounded-3xl border border-ab-border/80 bg-ab-surface p-6 pt-10 shadow-sm transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-ab-primary/30',
				className
			)}
		>
			{/* Status Badge - Top Left */}
			<div
				className={cn(
					'absolute -top-3 left-6 flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold tracking-tight',
					config.bg,
					config.text
				)}
			>
				{config.icon}
				{config.label}
			</div>

			{/* Max Marks Badge - Top Right */}
			<div className="absolute -top-3 right-6 rounded-full border-2 border-ab-surface bg-ab-primary px-5 py-1.5 text-xs font-bold capitalize tracking-[0.5px] text-primary-foreground shadow">
				Max Marks {maxMarks}
			</div>

			{/* Header */}
			<div className="space-y-2">
				<h3 className="line-clamp-2 text-2xl capitalize font-bold tracking-tight text-ab-text-primary">
					{title}
				</h3>

				<div className="flex flex-wrap justify-between items-center gap-x-5 gap-y-1 text-sm text-ab-text-secondary">
					<div className="flex items-center gap-1.5">
						<BookOpen className="size-4" />
						<span className="font-medium">{course}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Bookmark className="size-4 text-ab-primary" />
						<span className="font-medium">{unit}</span>
					</div>
				</div>
			</div>

			{/* Content Area */}
			<div className="min-h-23 border-y border-dashed border-ab-border/80 py-4">
				{status === 'NEW' && (
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<ClipboardList className="size-4 text-ab-text-secondary" />
							<span>Questions:</span>
							<span className="font-semibold text-ab-text-primary">{questions}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="size-4 text-ab-text-secondary" />
							<span>Duration:</span>
							<span className="font-semibold text-ab-text-primary">{duration}</span>
						</div>
					</div>
				)}

				{status === 'IN_PROGRESS' && (
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-ab-primary">Time Remaining</span>
							<span className="font-mono text-xl font-bold tracking-tighter text-ab-text-primary">
								{timeRemaining}
							</span>
						</div>
						<div className="h-1.5 w-full rounded-full bg-ab-border/50 overflow-hidden">
							<div className="h-full w-3/4 bg-linear-to-r from-ab-primary to-ab-primary-soft rounded-full" />
						</div>
					</div>
				)}

				{status === 'COMPLETED' && (
					<div className="flex items-center justify-between">
						<div>
							<div className="text-4xl font-bold tabular-nums tracking-tighter text-ab-text-primary">
								{gainedMarks}
								<span className="text-xl text-ab-text-secondary">/{maxMarks}</span>
							</div>
							<div className="text-sm text-ab-text-secondary mt-0.5">
								{percentage}% • Attempted {formatDate(attemptDate)}
							</div>
						</div>

						<div className="relative size-16">
							<svg className="size-16 -rotate-90" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="42"
									fill="none"
									stroke="currentColor"
									strokeWidth="10"
									className="text-ab-border/30"
								/>
								<circle
									cx="50"
									cy="50"
									r="42"
									fill="none"
									stroke="currentColor"
									strokeWidth="10"
									strokeDasharray={263}
									strokeDashoffset={263 - (263 * percentage) / 100}
									className="text-ab-green-text transition-all duration-500"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<CheckCircle2 className="size-8 text-ab-green-text" />
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Actions */}
			{status === 'NEW' && (
				<Button
					onClick={handleStartOrRetake}
					disabled={isLoading}
					className="h-14 w-full border-2 border-ab-border bg-ab-surface text-lg font-bold tracking-widest text-ab-text-primary hover:border-ab-primary hover:bg-ab-primary/5 hover:text-ab-primary active:scale-[0.985]"
					variant="outline"
				>
					{isLoading ?
						<>
							<Loader2 className="mr-2 size-5 animate-spin" />
							STARTING...
						</>
					:	'START TEST'}
				</Button>
			)}

			{status === 'IN_PROGRESS' && (
				<Button
					onClick={handleResumeTest}
					className="h-14 w-full bg-ab-primary text-lg font-bold tracking-widest text-primary-foreground hover:bg-ab-primary/90 active:scale-[0.985]"
				>
					RESUME TEST
				</Button>
			)}

			{status === 'COMPLETED' && (
				<div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
					<Button
						onClick={handleViewResult}
						variant="outline"
						className="h-14 flex-1 border-2 border-ab-border bg-ab-surface text-base font-semibold tracking-wide text-ab-text-primary hover:border-ab-primary hover:bg-ab-primary/5 hover:text-ab-primary"
					>
						View Result
					</Button>
					<Button
						onClick={handleStartOrRetake}
						disabled={isLoading}
						className="h-14 flex-1 bg-ab-primary text-base font-semibold tracking-wide text-primary-foreground hover:bg-ab-primary/90 active:scale-[0.985]"
					>
						{isLoading ?
							<>
								<Loader2 className="mr-2 size-5 animate-spin" />
								RETAKING...
							</>
						:	'Retake Test'}
					</Button>
				</div>
			)}
		</div>
	);
}
