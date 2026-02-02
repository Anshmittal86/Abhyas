// Breadcrumb + timer + user
function formatSeconds(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TestHeader({ remainingSeconds }: { remainingSeconds: number }) {
	return (
		<div className="flex items-center justify-between border-b border-default pb-4">
			<div className="text-sm text-muted">
				<span className="hover:text-accent-primary cursor-pointer">Dashboard</span>
				<span className="mx-2">/</span>
				<span>Test</span>
			</div>

			<div className="flex items-center gap-6">
				<div className="flex items-center gap-2 text-accent-warning font-medium">
					⏱️ {formatSeconds(Math.max(0, remainingSeconds))}
				</div>

				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-surface border border-default" />
					<span className="text-sm">Student</span>
				</div>
			</div>
		</div>
	);
}
