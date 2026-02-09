import { Rocket, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// ✅
export default function ComingSoon({ featureName = 'Leaderboard' }) {
	return (
		<div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 bg-ab-bg text-ab-text-primary">
			<div className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-ab-primary/10">
				<Rocket className="size-10 animate-bounce text-ab-primary" />
			</div>

			<div className="inline-block rounded-full bg-ab-primary/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ab-primary">
				Coming Soon
			</div>

			<h1 className="mt-6 text-center text-4xl font-bold tracking-tight uppercase sm:text-5xl">
				{featureName} is launching soon!
			</h1>

			<p className="mt-4 max-w-lg text-center text-lg text-ab-text-secondary">
				We&apos;re working hard to bring you the best experience. The{' '}
				<strong className="text-ab-text-primary">{featureName}</strong> will help you track your
				rank among peers across Abyash.
			</p>

			{/* Subscription */}
			<div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
				<Input
					type="email"
					placeholder="Enter your email for updates"
					className="h-12 border-2 border-ab-border/80 focus-visible:ring-ab-primary"
				/>
				<Button className="h-12 bg-ab-primary px-6 font-bold text-primary-foreground hover:bg-ab-primary/90">
					<Bell className="mr-2 size-4" />
					NOTIFY ME
				</Button>
			</div>

			<p className="mt-6 text-sm text-ab-text-secondary">
				Join 500+ students waiting for this feature.
			</p>
		</div>
	);
}
