interface QuizNavigatorProps {
	totalQuestions: number;
	currentIndex: number;
	answeredIds: Set<string>;
	questionIds: string[];
	onNavigate: (index: number) => void;
}

export function QuizNavigator({
	totalQuestions,
	currentIndex,
	answeredIds,
	questionIds,
	onNavigate
}: QuizNavigatorProps) {
	return (
		<div className="flex flex-wrap gap-2 justify-center">
			{Array.from({ length: totalQuestions }).map((_, i) => {
				const isCurrent = i === currentIndex;
				const isAnswered = answeredIds.has(questionIds[i]);

				return (
					<button
						key={i}
						onClick={() => onNavigate(i)}
						className={`
							w-9 h-9 rounded-lg text-xs font-semibold
							transition-all duration-200 border-2
							${
								isCurrent ? 'border-ab-primary bg-ab-primary text-white scale-110'
								: isAnswered ? 'border-ab-blue-text bg-ab-blue-bg text-ab-blue-text'
								: 'border-ab-border bg-ab-surface text-ab-text-secondary hover:border-ab-primary'
							}
						`}
					>
						{i + 1}
					</button>
				);
			})}
		</div>
	);
}
