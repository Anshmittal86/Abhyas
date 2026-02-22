'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { TestQuestionProgress } from '@/types/tests';

type Props = {
	progress: TestQuestionProgress;
	isRefreshing?: boolean;
};

export default function QuestionProgressCard({ progress, isRefreshing = false }: Props) {
	const {
		title,
		maxQuestions,
		questionCount,
		remainingQuestions,
		progressPercentage,
		isCompleted
	} = progress;

	return (
		<Card className="border-ab-border bg-ab-surface">
			<CardHeader className="space-y-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-xl">{title}</CardTitle>

						<CardDescription>Question Creation Progress</CardDescription>
					</div>

					<div className="flex items-center gap-2">
						{isRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

						{isCompleted ?
							<Badge className="bg-green-600 hover:bg-green-600">
								<CheckCircle className="h-3 w-3 mr-1" />
								Completed
							</Badge>
						:	<Badge variant="secondary">In Progress</Badge>}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex justify-between text-sm">
					<span className="font-medium">
						{questionCount} of {maxQuestions} questions created
					</span>

					<span className="text-muted-foreground">{progressPercentage}%</span>
				</div>

				<Progress value={progressPercentage} className="h-3" />

				<div className="flex justify-between text-sm text-muted-foreground">
					<span>Remaining: {remainingQuestions}</span>

					<span>Total: {maxQuestions}</span>
				</div>

				{isCompleted && (
					<div className="text-sm text-green-600 font-medium">
						All required questions have been created. You can now publish or review the test.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
