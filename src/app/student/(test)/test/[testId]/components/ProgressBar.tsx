// Question X of Y
export default function ProgressBar({
	currentIndex,
	totalQuestions
}: {
	currentIndex: number;
	totalQuestions: number;
}) {
	const safeTotal = Math.max(1, totalQuestions);
	const safeIndex = Math.min(Math.max(0, currentIndex), safeTotal - 1);
	const percent = Math.round(((safeIndex + 1) / safeTotal) * 100);

	return (
		<div className="space-y-2">
			<div className="flex justify-between text-sm text-muted">
				<span>
					Question {safeIndex + 1} of {totalQuestions}
				</span>
				<span>{percent}%</span>
			</div>

			<div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
				<div className="h-full bg-amber-600" style={{ width: `${percent}%` }} />
			</div>
		</div>
	);
}
