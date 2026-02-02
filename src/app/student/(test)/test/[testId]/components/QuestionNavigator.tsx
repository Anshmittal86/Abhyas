// Status indicators for questions (no navigation)
export default function QuestionNavigator({
	totalQuestions,
	answeredCount
}: {
	totalQuestions: number;
	answeredCount: number;
}) {
	return (
		<div className="flex items-center gap-2 flex-wrap">
			{Array.from({ length: totalQuestions }).map((_, i) => {
				const attempted = i < answeredCount;
				return (
					<div
						key={i}
						className={[
							'w-8 h-8 rounded border text-sm flex items-center justify-center select-none',
							attempted ?
								'bg-green-100 border-green-500 text-green-800'
							:	'bg-red-100 border-red-500 text-red-800'
						].join(' ')}
						title={attempted ? 'Attempted' : 'Unattempted'}
					>
						{i + 1}
					</div>
				);
			})}
		</div>
	);
}
