import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { HelpCircle } from 'lucide-react';
import CreateQuestionFormSheet from '@/components/forms/CreateQuestionFormSheet';

export function EmptyQuestions() {
	return (
		<Empty className="bg-ab-surface text-ab-text-primary border border-ab-border rounded-2xl h-full">
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="bg-ab-primary/10 text-ab-primary border border-ab-border"
				>
					<HelpCircle />
				</EmptyMedia>

				<EmptyTitle className="text-ab-text-primary font-black">No questions found</EmptyTitle>

				<EmptyDescription className="text-ab-text-secondary font-medium">
					You haven&apos;t added any questions yet. Create your first question to get started.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent className="flex-row justify-center gap-2">
				<CreateQuestionFormSheet
					trigger={
						<Button
							variant="outline"
							className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer `}
						>
							Create Question
						</Button>
					}
				/>
			</EmptyContent>
		</Empty>
	);
}
