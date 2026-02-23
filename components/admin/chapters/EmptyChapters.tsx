import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChapterFormSheet from '@/components/forms/ChapterFromSheet';

export default function EmptyChapters({
	onCreateClick,
	className = ''
}: {
	onCreateClick?: () => void;
	className?: string;
}) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}
		>
			{/* Icon */}
			<div className="w-24 h-24 bg-ab-primary/10 rounded-3xl flex items-center justify-center mb-6">
				<BookOpen className="h-12 w-12 text-ab-primary" />
			</div>

			{/* Title */}
			<h3 className="text-2xl md:text-3xl font-black bg-linear-to-r from-ab-text-primary to-ab-primary bg-clip-text text-transparent mb-3">
				No Chapters Yet
			</h3>

			{/* Description */}
			<p className="text-lg font-medium text-ab-text-secondary max-w-md mb-8 leading-relaxed">
				Chapters are the building blocks of your courses. Create your first chapter to get started
				with course content.
			</p>

			{/* Action Button */}
			{onCreateClick ?
				<Button
					onClick={onCreateClick}
					className="h-14 px-8 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-ab-primary/20 transition-all active:scale-95 gap-2 border-2 border-transparent hover:border-ab-primary/50"
				>
					<Plus className="h-5 w-5" />
					Create First Chapter
				</Button>
			:	<ChapterFormSheet
					mode="create"
					trigger={
						<Button className="h-14 px-8 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-ab-primary/20 transition-all active:scale-95 gap-2 border-2 border-transparent hover:border-ab-primary/50">
							<Plus className="h-5 w-5" />
							Create First Chapter
						</Button>
					}
					onSuccess={onCreateClick}
				/>
			}
		</div>
	);
}
