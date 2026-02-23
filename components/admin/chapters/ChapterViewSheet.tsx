'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ChapterFormSheet from '@/components/forms/ChapterFromSheet';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import { Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';
import { ChapterTypes, SuccessResponseTypes } from '@/types';
import { toast } from 'sonner';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chapterId: string | null;
};

export default function ChapterViewSheet({ open, onOpenChange, chapterId }: Props) {
	const [chapter, setChapter] = useState<ChapterTypes | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || !chapterId) return;

		const fetchChapter = async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/admin/chapter/${chapterId}`, {
					method: 'GET',
					credentials: 'include'
				});

				const result = (await res.json()) as SuccessResponseTypes<ChapterTypes>;
				if (!result?.success) {
					setChapter(null);
					return;
				}
				setChapter(result.data || null);
			} catch (error) {
				console.error(error);
				setChapter(null);
			} finally {
				setLoading(false);
			}
		};

		fetchChapter();
	}, [chapterId, open]);

	useEffect(() => {
		if (!open) {
			setChapter(null);
		}
	}, [open]);

	if (loading) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<Loader size={35} height="full" showIcon message="Loading Chapter Details..." />
				</SheetContent>
			</Sheet>
		);
	}

	if (!chapter) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<p className="text-center text-ab-text-secondary py-10">Chapter data not available</p>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">Chapter Details</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-8">
					{/* Chapter Header */}
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<p className="text-2xl font-black text-ab-text-primary">{chapter.title}</p>
							<span className="px-3 py-1 bg-ab-primary/10 text-ab-primary text-xs font-bold rounded-full">
								{chapter.code}
							</span>
						</div>
						<p className="text-sm font-bold text-ab-primary">Order: #{chapter.orderNo}</p>
						<p className="text-sm text-ab-text-secondary">
							Created: {new Date(chapter.createdAt).toLocaleDateString() || 'Date not found'}
						</p>
					</div>

					{/* Basic Info Grid */}
					<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border p-4">
						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Course</p>
							<p className="font-black">{chapter.course.title}</p>
							{chapter.course.description && (
								<p className="text-xs text-ab-text-secondary mt-1">{chapter.course.description}</p>
							)}
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Admin</p>
							<p className="font-black">{chapter.admin.name}</p>
							<p className="text-xs text-ab-text-secondary">{chapter.admin.email}</p>
						</div>
					</div>

					{/* Tests */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Tests ({chapter.tests?.length ?? 0})
						</p>

						{chapter.tests?.length === 0 && (
							<p className="text-sm text-ab-text-secondary">No tests created yet</p>
						)}

						{chapter.tests?.map((test) => (
							<div
								key={test.id}
								className="flex justify-between items-center p-3 bg-ab-surface/50 rounded-lg"
							>
								<span className="font-black truncate">{test.title}</span>
							</div>
						))}
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-2 pt-4">
						<ChapterFormSheet
							mode="update"
							chapterId={chapter.id}
							defaultValues={{
								code: chapter.code,
								title: chapter.title,
								orderNo: chapter.orderNo
							}}
							trigger={
								<Button variant="outline" className="font-bold flex-1 sm:flex-none">
									<Edit3 className="h-4 w-4 mr-2" />
									Update Chapter
								</Button>
							}
						/>

						<AlertDialogBox
							name={chapter.title}
							onConfirm={async () => {
								try {
									setDeleting(true);
									const res = await fetch(`/api/admin/chapter/${chapter.id}`, {
										method: 'DELETE',
										credentials: 'include'
									});

									if (!res.ok) {
										throw new Error('Failed to delete chapter');
									}

									const result = (await res.json()) as SuccessResponseTypes<null>;
									if (result.success) {
										onOpenChange(false);
									}
								} catch (error) {
									const errorMessage =
										error instanceof Error ? error.message : 'Failed to delete chapter';
									toast.error(errorMessage);
									console.error('chapter delete:', error);
								} finally {
									setDeleting(false);
								}
							}}
							trigger={
								<Button
									variant="outline"
									disabled={deleting}
									className="font-bold text-ab-pink-text flex-1 sm:flex-none"
								>
									Delete Chapter
								</Button>
							}
							title="Delete this chapter?"
							description={`Permanently delete "${chapter.title}"? This action cannot be undone.`}
						/>

						<SheetClose asChild>
							<Button variant="outline" className="flex-1 sm:flex-none">
								Close
							</Button>
						</SheetClose>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
