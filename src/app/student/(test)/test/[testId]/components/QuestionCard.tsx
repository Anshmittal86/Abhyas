// Question text
export type TestQuestion = {
	id: string;
	text: string;
	options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
};

export default function QuestionCard({ question }: { question: TestQuestion }) {
	return (
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">{question.text}</h2>
		</div>
	);
}
