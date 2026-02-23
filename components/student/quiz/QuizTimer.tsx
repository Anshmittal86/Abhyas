import { Clock } from 'lucide-react';

interface QuizTimerProps {
	secondsLeft: number;
	percentage: number;
	formatTime: (s: number) => string;
}

export function QuizTimer({ secondsLeft, percentage, formatTime }: QuizTimerProps) {
	const isWarning = secondsLeft <= 30 && secondsLeft > 10;
	const isDanger = secondsLeft <= 10;

	const timerColor =
		isDanger ? 'text-ab-pink-text'
		: isWarning ? 'text-ab-purple-text'
		: 'text-ab-blue-text';

	const barColor =
		isDanger ? 'bg-ab-pink-bg'
		: isWarning ? 'bg-ab-purple-bg'
		: 'bg-ab-blue-bg';

	return (
		<div className="flex items-center gap-3">
			<Clock className={`h-5 w-5 ${timerColor} ${isDanger ? 'animate-pulse' : ''}`} />

			<div className="flex items-center gap-3 min-w-35">
				<div className="w-20 h-2 rounded-full bg-ab-border overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
						style={{ width: `${percentage}%` }}
					/>
				</div>

				<span className={`font-mono text-sm font-semibold tabular-nums ${timerColor}`}>
					{formatTime(secondsLeft)}
				</span>
			</div>
		</div>
	);
}
