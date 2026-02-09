import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
// ✅
export default function ActiveTestPage() {
	return (
		<div className="flex h-screen flex-col bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<header className="flex items-center justify-between border-b border-ab-border/40 bg-ab-surface px-6 py-4">
				<div className="flex items-center gap-4">
					<h2 className="text-xl font-bold uppercase tracking-tight">HTML Basic Quiz</h2>

					<div className="flex items-center gap-2 rounded-full border border-ab-border/40 bg-ab-primary/10 px-3 py-1 text-ab-primary">
						<Clock className="size-4 animate-pulse" />
						<span className="font-mono text-sm font-bold">45:12</span>
					</div>
				</div>

				<div className="flex w-1/3 items-center gap-6">
					<div className="flex-1 space-y-1">
						<div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
							<span>Progress</span>
							<span>12 / 50 Questions</span>
						</div>
						<Progress value={24} className="h-2 bg-ab-border/40 shadow-inner" />
					</div>

					<Button className="bg-destructive px-6 font-bold hover:bg-destructive/90">
						FINISH TEST
					</Button>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden">
				{/* Main */}
				<main className="flex flex-1 flex-col items-center overflow-y-auto p-12">
					<div className="w-full max-w-3xl space-y-8">
						{/* Question */}
						<div className="space-y-4">
							<span className="text-sm font-bold uppercase tracking-widest text-ab-primary">
								Question 12
							</span>
							<h1 className="text-2xl font-semibold leading-relaxed">
								What does HTML stand for in web development terminology?
							</h1>
						</div>

						{/* Options */}
						<div className="grid gap-4">
							{[
								'Hyper Text Preprocessor',
								'Hyper Text Markup Language',
								'Hyper Text Multiple Language',
								'Hyper Tool Multi Language'
							].map((option, idx) => (
								<button
									key={idx}
									className={cn(
										'group flex items-center rounded-2xl border-2 p-5 text-left transition-all',
										idx === 1 ?
											'border-ab-primary bg-ab-primary/10 shadow-sm'
										:	'border-ab-border/40 bg-ab-surface hover:border-ab-primary/40'
									)}
								>
									<div
										className={cn(
											'mr-4 flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold',
											idx === 1 ?
												'border-ab-primary bg-ab-primary text-primary-foreground'
											:	'border-ab-border/60 text-ab-text-secondary group-hover:border-ab-primary'
										)}
									>
										{String.fromCharCode(65 + idx)}
									</div>

									<span className="font-medium">{option}</span>
								</button>
							))}
						</div>

						{/* Navigation */}
						<div className="flex justify-between border-t border-dashed border-ab-border/40 pt-8">
							<Button
								variant="outline"
								className="rounded-xl border-2 border-ab-border/40 px-6 font-bold"
							>
								<ChevronLeft className="mr-2 size-5" />
								PREVIOUS
							</Button>

							<div className="flex gap-3">
								<Button
									variant="ghost"
									className="rounded-xl font-bold text-ab-text-secondary transition-colors hover:text-destructive"
								>
									<Flag className="mr-2 size-4" />
									MARK FOR REVIEW
								</Button>

								<Button className="rounded-xl bg-ab-primary px-8 font-bold text-primary-foreground transition-all hover:bg-ab-primary/90">
									SAVE & NEXT
									<ChevronRight className="ml-2 size-5" />
								</Button>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
