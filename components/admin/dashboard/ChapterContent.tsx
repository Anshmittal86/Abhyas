import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, BookPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import ChapterFormSheet from '@/components/forms/ChapterFromSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/common/Loader';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import EmptyChapters from '@/components/admin/chapters/EmptyChapters';
import ChapterViewSheet from '@/components/admin/chapters/ChapterViewSheet';
import { fetchChapters } from '@/lib/api';
import { ChaptersListTypes, ChapterTypes, SuccessResponseTypes } from '@/types';

export function ChapterContent() {
	const [chapters, setChapters] = useState<ChaptersListTypes[]>([]);
	const [filteredChapters, setFilteredChapters] = useState<ChaptersListTypes[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
	const [selectedChapterData, setSelectedChapterData] = useState<ChapterTypes | null>(null);
	const [updateOpen, setUpdateOpen] = useState(false);
	const [viewOpen, setViewOpen] = useState(false);
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('search') || '';

	// Filter chapters when search query changes
	useEffect(() => {
		if (searchQuery) {
			const filtered = chapters.filter(
				(chapter) =>
					chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					chapter.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
					chapter.course.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredChapters(filtered);
		} else {
			setFilteredChapters(chapters);
		}
	}, [searchQuery, chapters]);

	const handleSelectChapter = (chapter: ChaptersListTypes, action: 'view' | 'update') => {
		setSelectedChapterId(chapter.id);
		setSelectedChapterData({
			code: chapter.code,
			title: chapter.title,
			orderNo: chapter.orderNo
		} as ChapterTypes); // Set the selected chapter data for the form

		if (action === 'update') {
			setUpdateOpen(true);
		} else {
			setViewOpen(true);
		}
	};

	const loadChapters = async () => {
		setLoading(true);
		try {
			const chapters = await fetchChapters();

			setChapters(chapters || []);
			setFilteredChapters(chapters || []);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadChapters();
	}, []);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const params = new URLSearchParams(searchParams);
		if (e.target.value) {
			params.set('search', e.target.value);
		} else {
			params.delete('search');
		}
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const handleClearSearch = () => {
		const params = new URLSearchParams(searchParams);
		params.delete('search');
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};
	const handleDeleteChapter = async (chapterId: string) => {
		try {
			const response = await fetch(`/api/admin/chapter/${chapterId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = (await response.json()) as SuccessResponseTypes<null>;
			if (result.success) {
				toast.success(result.message || 'Chapter deleted successfully');
				await loadChapters(); // Refresh table
			} else {
				throw new Error(result.message || 'Failed to delete chapter');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete chapter';
			toast.error(errorMessage);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
				<Loader message="Loading chapters..." />
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-black tracking-tight">Chapters</h2>
					<p className="text-sm font-medium italic text-ab-text-secondary">
						Manage chapters and track test activity.
					</p>
				</div>
			</div>

			{/* Filters & Create Button */}
			<div className="flex justify-between items-center gap-4">
				<div className="relative w-full max-w-sm group">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search by title, code or course..."
						className="h-11 rounded-xl border-2 border-ab-border/80 pl-10 pr-10 focus-visible:ring-ab-primary/20"
						value={searchQuery}
						onChange={handleSearch}
					/>
					{searchQuery && (
						<button
							onClick={handleClearSearch}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-ab-text-secondary hover:text-ab-text-primary transition-colors"
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				<ChapterFormSheet
					mode="create"
					onSuccess={loadChapters}
					trigger={
						<Button
							variant="outline"
							className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer `}
						>
							<BookPlus className="h-5 w-5" />
							Create Chapter
						</Button>
					}
				/>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border/80 bg-ab-surface shadow-sm">
				<Table>
					<TableHeader className="bg-ab-border/20">
						<TableRow className="border-b-2 hover:bg-transparent">
							<TableHead className="py-5 pl-8 text-[11px] font-black uppercase tracking-widest">
								Chapter
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Course
							</TableHead>
							<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
								Tests
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Order
							</TableHead>
							<TableHead className="pr-8 text-right text-[11px] font-black uppercase tracking-widest">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading && chapters.length === 0 ?
							<TableRow>
								<TableCell colSpan={5} className="text-center py-10">
									<Loader size={30} showIcon message="Loading chapters..." />
								</TableCell>
							</TableRow>
						: filteredChapters.length === 0 ?
							<TableRow>
								<TableCell colSpan={5}>
									<EmptyChapters />
								</TableCell>
							</TableRow>
						:	filteredChapters.map((chapter) => (
								<TableRow
									key={chapter.id}
									className="group transition-colors hover:bg-ab-primary/5"
								>
									<TableCell className="py-5 pl-8">
										<div className="flex flex-col max-w-md">
											<span className="text-[15px] font-black">{chapter.title}</span>
											<span className="text-[11px] font-bold text-ab-primary">{chapter.code}</span>
											<span className="text-[11px] font-medium text-ab-text-secondary mt-1">
												Created:{' '}
												{new Date(chapter.createdAt).toLocaleDateString() || 'Date not found'}
											</span>
										</div>
									</TableCell>

									<TableCell>
										<span className="font-bold">{chapter.course.title}</span>
									</TableCell>

									<TableCell className="text-center font-black">{chapter.testCount}</TableCell>

									<TableCell className="font-bold">#{chapter.orderNo}</TableCell>

									<TableCell className="pr-8 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0 transition hover:bg-ab-primary/10 hover:text-ab-primary"
												>
													<MoreHorizontal className="h-5 w-5" />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align="end"
												className="rounded-xl border-2 border-ab-border/80"
											>
												<DropdownMenuItem
													className="cursor-pointer font-bold flex justify-center"
													onClick={() => handleSelectChapter(chapter, 'view')}
												>
													View Chapter
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer font-bold flex justify-center"
													onClick={() => handleSelectChapter(chapter, 'update')}
												>
													Update Chapter
												</DropdownMenuItem>

												<AlertDialogBox
													name={chapter.title}
													onConfirm={() => handleDeleteChapter(chapter.id)}
													trigger={
														<Button
															variant="ghost"
															className="w-full flex justify-center font-bold text-ab-pink-text hover:bg-ab-pink-bg/50 h-8 px-2"
														>
															Delete Chapter
														</Button>
													}
													title="Delete this chapter?"
													description={`Permanently delete "${chapter.title}"? This action cannot be undone.`}
												/>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</div>

			{/* Update Form Sheet */}
			<ChapterFormSheet
				mode="update"
				chapterId={selectedChapterId || undefined}
				defaultValues={selectedChapterData || undefined} // Add this
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				onSuccess={() => {
					loadChapters();
					setUpdateOpen(false);
					setSelectedChapterId(null); // Reset
					setSelectedChapterData(null); // Reset
				}}
			/>

			{/* View Sheet */}
			<ChapterViewSheet open={viewOpen} onOpenChange={setViewOpen} chapterId={selectedChapterId} />
		</div>
	);
}
