import { StudentFormSheet } from '@/components/forms/StudentFormSheet';
import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { GraduationCap } from 'lucide-react';
import { fetchStudents } from '@/lib/api';

export function EmptyStudents() {
	return (
		<Empty className="bg-ab-surface text-ab-text-primary border border-ab-border rounded-2xl h-full">
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="bg-ab-primary/10 text-ab-primary border border-ab-border"
				>
					<GraduationCap />
				</EmptyMedia>

				<EmptyTitle className="text-ab-text-primary font-black">No students found</EmptyTitle>

				<EmptyDescription className="text-ab-text-secondary font-medium">
					You haven&apos;t added any students yet. Add your first student to get started.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent className="flex-row justify-center gap-2">
				<StudentFormSheet
					mode="create"
					onSuccess={fetchStudents}
					trigger={
						<Button
							variant="outline"
							className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer `}
						>
							Add Student
						</Button>
					}
				/>
			</EmptyContent>
		</Empty>
	);
}
