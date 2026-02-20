import CreateTestFormSheet from '@/components/forms/createTestFormSheet';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { GraduationCap } from 'lucide-react';

export function EmptyTests() {
	return (
		<Empty className="bg-ab-surface text-ab-text-primary border border-ab-border rounded-2xl h-full">
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="bg-ab-primary/10 text-ab-primary border border-ab-border"
				>
					<GraduationCap />
				</EmptyMedia>

				<EmptyTitle className="text-ab-text-primary font-black">No tests found</EmptyTitle>

				<EmptyDescription className="text-ab-text-secondary font-medium">
					You haven&apos;t added any tests yet. Add your first test to get started.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent className="flex-row justify-center gap-2">
				<CreateTestFormSheet
					onSuccess={() => {
						console.log('Test created successfully');
					}}
					trigger={'Create Test'}
				/>
			</EmptyContent>
		</Empty>
	);
}
