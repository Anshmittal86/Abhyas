'use client';
// ✅
import { Button } from '@/components/ui/button';
import { BookOpen, Bookmark, Clock, ClipboardList, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type TestStatus = 'not_started' | 'in_progress' | 'completed';

interface TestCardProps {
	title: string;
	course: string;
	unit: string;
	maxMarks: number;
	questions?: number;
	duration?: string;
	status?: TestStatus;
	timeRemaining?: string;
	score?: string;
	className?: string;
}

export function TestCard({
	title,
	course,
	unit,
	maxMarks,
	questions,
	duration,
	status = 'not_started',
	timeRemaining,
	score,
	className
}: TestCardProps) {
	const router = useRouter();

	const handleStartTest = async (testId: string) => {
		const res = await fetch(`/api/student/tests/${testId}/start`, {
			method: 'POST'
		});
		const data = await res.json();

		if (data.success) {
			router.push(`/test/active/${data.data.attemptId}`);
		} else {
			toast.error(data.message);
		}
	};

	return (
		<div
			className={cn(
				'relative flex flex-col gap-5 rounded-2xl border border-ab-border/80 bg-ab-surface p-6 pt-8 shadow-sm transition-all hover:shadow-md',
				className
			)}
		>
			{/* Max Marks Badge */}
			<div className="absolute -top-3 right-6 rounded-full border-2 border-ab-bg bg-ab-primary px-4 py-1 text-[10px] font-bold uppercase tracking-tight text-primary-foreground shadow-sm">
				Max Marks: {maxMarks}
			</div>

			{/* Header */}
			<div className="space-y-1">
				<h3 className="text-2xl font-bold uppercase tracking-tight text-ab-text-primary">
					{title}
				</h3>

				<div className="flex items-center gap-4 text-ab-text-secondary">
					<div className="flex items-center gap-1.5">
						<BookOpen className="size-4" />
						<span className="text-sm font-medium">{course}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Bookmark className="size-4 text-ab-primary" />
						<span className="text-sm font-medium">{unit}</span>
					</div>
				</div>
			</div>

			{/* Status Content */}
			<div className="space-y-3 border-y border-dashed border-ab-border/80 py-2">
				{status === 'not_started' && (
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="flex items-center gap-2">
							<ClipboardList className="size-4" />
							Questions:
							<span className="font-bold">{questions}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="size-4" />
							Duration:
							<span className="font-bold">{duration}</span>
						</div>
					</div>
				)}

				{status === 'in_progress' && (
					<div className="space-y-2">
						<div className="flex justify-between text-sm font-medium">
							<span className="animate-pulse text-ab-primary">
								● Time Remaining: {timeRemaining}
							</span>
							<span className="text-ab-text-secondary">Status: In Progress</span>
						</div>
					</div>
				)}

				{status === 'completed' && (
					<div className="flex items-center justify-between">
						<div className="text-sm">
							<p className="text-ab-text-secondary">
								Score:{' '}
								<span className="text-xl font-bold text-ab-text-primary">
									{score}/{maxMarks}
								</span>
							</p>
							<p className="mt-2 flex items-center gap-1 text-lg font-bold text-ab-green-text capitalize">
								<CheckCircle2 className="size-3" />
								Status: Completed
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Actions */}
			{status === 'not_started' ?
				<Button
					variant="outline"
					onClick={handleStartTest}
					className="w-full border-2 border-ab-border/80 bg-ab-surface py-5 text-lg font-black tracking-widest text-ab-text-primary transition-all hover:border-ab-primary/40 hover:bg-ab-primary/5 hover:text-ab-primary"
				>
					START
				</Button>
			: status === 'in_progress' ?
				<Button className="w-full bg-ab-primary py-6 font-bold tracking-widest text-primary-foreground transition-all hover:bg-ab-primary/90">
					RESUME TEST
				</Button>
			:	null}
		</div>
	);
}
