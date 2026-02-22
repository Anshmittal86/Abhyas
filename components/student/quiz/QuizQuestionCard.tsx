import { Question, QuizAnswer } from '@/types/quiz';
import { Check } from 'lucide-react';

interface QuizQuestionCardProps {
	question: Question;
	questionNumber: number;
	totalQuestions: number;
	currentAnswer?: QuizAnswer;
	onAnswer: (answer: QuizAnswer) => void;
}

export function QuizQuestionCard({
	question,
	questionNumber,
	totalQuestions,
	currentAnswer,
	onAnswer
}: QuizQuestionCardProps) {
	const handleSelect = (optionId: string) => {
		onAnswer({ questionId: question.id, answer: optionId });
	};

	const typeBadge = question.type === 'TRUE_FALSE' ? 'True / False' : 'Multiple Choice';

	return (
		<div className="w-full max-w-2xl mx-auto">
			{/* Question header */}
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium text-ab-text-secondary">
					Question {questionNumber} of {totalQuestions}
				</span>

				<span className="text-xs font-semibold px-3 py-1 rounded-full bg-ab-blue-bg text-ab-blue-text">
					{typeBadge}
				</span>
			</div>

			{/* Question text */}
			<h2 className="text-xl font-semibold text-ab-text-primary mb-6 leading-relaxed">
				{question.question}
			</h2>

			{/* Options */}
			<div className="space-y-3">
				{question.options?.map((option, index) => {
					const isSelected = currentAnswer?.answer === option.id;
					const letter = String.fromCharCode(65 + index);

					return (
						<button
							key={option.id}
							onClick={() => handleSelect(option.id)}
							className={`
								w-full text-left flex items-center gap-4
								rounded-xl border border-ab-border
								bg-ab-surface px-4 py-3
								transition-all duration-200
								hover:bg-ab-primary/5
								${isSelected ? 'bg-ab-primary/10 border-ab-primary' : ''}
							`}
						>
							<span
								className={`
									shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold
									transition-colors duration-200
									${isSelected ? 'bg-ab-primary text-white' : 'bg-ab-border text-ab-text-primary'}
								`}
							>
								{isSelected ?
									<Check className="h-4 w-4" />
								:	letter}
							</span>

							<span
								className={`text-sm font-medium ${
									isSelected ? 'text-ab-text-primary' : 'text-ab-text-primary'
								}`}
							>
								{option.text}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
