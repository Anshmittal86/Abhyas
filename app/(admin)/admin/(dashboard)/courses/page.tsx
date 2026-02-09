'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { CourseFormSheet } from '@/components/admin/CourseFormSheet';
import { ChapterFormSheet, type ChapterForEdit } from '@/components/admin/ChapterFormSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type CourseListItem = {
	id: string;
	title: string;
	description: string | null;
	duration: string | null;
	isActive: boolean;
	enrollmentCount: number;
	createdAt: string;
};

type CourseDetail = {
	id: string;
	title: string;
	description: string | null;
	duration: string | null;
	isActive: boolean;
	createdAt: string;
	chapters: { id: string; code: string; title: string; orderNo: number }[];
	enrollments?: { id: string }[];
};

/** Minimal fields needed for edit form; both CourseListItem and CourseDetail have these */
type CourseForEdit = Pick<CourseListItem, 'id' | 'title' | 'description' | 'duration' | 'isActive'>;

export default function AdminCoursesPage() {
	const [courses, setCourses] = useState<CourseListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [viewOpen, setViewOpen] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
	const [courseToEdit, setCourseToEdit] = useState<CourseForEdit | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [addChapterOpen, setAddChapterOpen] = useState(false);
	const [editChapterOpen, setEditChapterOpen] = useState(false);
	const [chapterToEdit, setChapterToEdit] = useState<ChapterForEdit | null>(null);
	const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

	const fetchCourses = useCallback(async () => {
		setLoading(true);
		setHasError(false);
		try {
			const response = await apiFetch('/api/admin/course', {
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) throw new Error(`API error: ${response.status}`);
			const result = await response.json();
			setCourses(result.data ?? []);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/admin-login';
				return;
			}
			console.error('Admin courses fetch error:', error);
			setHasError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	const openView = useCallback(async (course: CourseListItem) => {
		setViewOpen(true);
		setDetailLoading(true);
		setSelectedCourse(null);
		try {
			const response = await apiFetch(`/api/admin/course/${course.id}`, {
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) throw new Error(`API error: ${response.status}`);
			const result = await response.json();
			setSelectedCourse(result.data as CourseDetail);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/admin-login';
				return;
			}
			console.error('Course detail fetch error:', error);
		} finally {
			setDetailLoading(false);
		}
	}, []);

	const openEdit = useCallback((course: CourseForEdit) => {
		setCourseToEdit(course);
		setEditOpen(true);
	}, []);

	const refreshCourseDetail = useCallback(async (courseId: string) => {
		try {
			const response = await apiFetch(`/api/admin/course/${courseId}`, {
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) return;
			const result = await response.json();
			setSelectedCourse(result.data as CourseDetail);
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/admin-login';
				return;
			}
		}
	}, []);

	const openAddChapter = useCallback(() => {
		setAddChapterOpen(true);
	}, []);

	const openEditChapter = useCallback((chapter: ChapterForEdit) => {
		setChapterToEdit(chapter);
		setEditChapterOpen(true);
	}, []);

	const deleteChapter = useCallback(
		async (courseId: string, chapterId: string) => {
			if (!window.confirm('Delete this chapter? Tests under it will also be removed.')) return;
			setDeletingChapterId(chapterId);
			try {
				const response = await apiFetch(`/api/admin/chapter/${chapterId}`, { method: 'DELETE' });
				if (!response.ok) throw new Error(`API error: ${response.status}`);
				await refreshCourseDetail(courseId);
			} catch (error) {
				if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
					window.location.href = '/admin-login';
					return;
				}
				console.error('Delete chapter error:', error);
			} finally {
				setDeletingChapterId(null);
			}
		},
		[refreshCourseDetail]
	);

	useEffect(() => {
		void fetchCourses();
	}, [fetchCourses]);

	if (loading) return <LoadingState />;
	if (hasError) return <ErrorState onRetry={fetchCourses} />;

	return (
		<main className="flex-1 overflow-auto px-8 py-6 space-y-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-primary">Courses</h1>
					<p className="text-sm text-secondary">Create and manage courses and their chapters.</p>
				</div>
				<Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
					Create Course
				</Button>
			</div>

			<div className="bg-surface border border-default rounded-xl overflow-hidden">
				<div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-default text-xs text-muted uppercase tracking-wide">
					<div className="col-span-4">Course</div>
					<div className="col-span-2">Duration</div>
					<div className="col-span-2">Enrollments</div>
					<div className="col-span-2">Status</div>
					<div className="col-span-2">Actions</div>
				</div>

				{courses.length === 0 ?
					<div className="p-6 text-secondary">No courses yet. Create one to get started.</div>
				:	courses.map((c) => (
						<div
							key={c.id}
							className="grid grid-cols-12 gap-3 px-4 py-4 border-b border-default last:border-b-0 items-center"
						>
							<div className="col-span-4">
								<div className="text-primary font-medium">{c.title}</div>
								{c.description ?
									<div className="text-xs text-muted line-clamp-1">{c.description}</div>
								:	null}
							</div>
							<div className="col-span-2 text-primary">{c.duration ?? '—'}</div>
							<div className="col-span-2 text-primary">{c.enrollmentCount}</div>
							<div className="col-span-2">
								<span
									className={[
										'inline-flex items-center rounded-full px-2 py-1 text-xs border',
										c.isActive ?
											'border-accent-success text-accent-success'
										:	'border-accent-error text-accent-error'
									].join(' ')}
								>
									{c.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
							<div className="col-span-2 flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="cursor-pointer"
									onClick={() => openView(c)}
								>
									View
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="cursor-pointer"
									onClick={() => openEdit(c)}
								>
									Edit
								</Button>
							</div>
						</div>
					))
				}
			</div>

			<CourseFormSheet
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				onSuccess={fetchCourses}
			/>

			<CourseFormSheet
				open={editOpen}
				onOpenChange={setEditOpen}
				mode="edit"
				course={courseToEdit}
				onSuccess={fetchCourses}
			/>

			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent
					className="w-full sm:max-w-lg bg-surface border-l border-default overflow-y-auto"
					style={{
						backgroundColor: 'var(--color-bg-surface)',
						borderColor: 'var(--color-border-default)'
					}}
				>
					<SheetHeader>
						<SheetTitle className="text-primary">Course Details</SheetTitle>
					</SheetHeader>
					<div className="mt-6 space-y-4">
						{detailLoading ?
							<div className="text-secondary">Loading…</div>
						: selectedCourse ?
							<>
								<div className="space-y-2">
									<div className="text-sm text-muted">Title</div>
									<div className="text-primary font-medium">{selectedCourse.title}</div>
								</div>
								{selectedCourse.description ?
									<div className="space-y-2">
										<div className="text-sm text-muted">Description</div>
										<div className="text-primary text-sm">{selectedCourse.description}</div>
									</div>
								:	null}
								<div className="space-y-2">
									<div className="text-sm text-muted">Duration</div>
									<div className="text-primary">{selectedCourse.duration ?? '—'}</div>
								</div>
								<div className="space-y-2">
									<div className="text-sm text-muted">Status</div>
									<span
										className={[
											'inline-flex items-center rounded-full px-2 py-1 text-xs border',
											selectedCourse.isActive ?
												'border-accent-success text-accent-success'
											:	'border-accent-error text-accent-error'
										].join(' ')}
									>
										{selectedCourse.isActive ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div className="space-y-2">
									<div className="text-sm text-muted">Enrollments</div>
									<div className="text-primary">{selectedCourse.enrollments?.length ?? 0}</div>
								</div>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="text-sm text-muted font-medium">Chapters</div>
										<Button
											type="button"
											size="sm"
											className="cursor-pointer"
											onClick={openAddChapter}
										>
											Add Chapter
										</Button>
									</div>
									{selectedCourse.chapters?.length ?
										<div className="rounded-lg border border-default divide-y divide-default">
											{[...selectedCourse.chapters]
												.sort((a, b) => a.orderNo - b.orderNo)
												.map((ch) => (
													<div
														key={ch.id}
														className="flex items-center justify-between gap-2 px-3 py-2 text-primary text-sm"
													>
														<div>
															<span className="font-medium">{ch.title}</span>
															<span className="text-muted ml-2">({ch.code})</span>
															<span className="text-muted ml-2">Order: {ch.orderNo}</span>
														</div>
														<div className="flex gap-1 shrink-0">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="cursor-pointer h-8"
																onClick={() => openEditChapter(ch)}
															>
																Edit
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="cursor-pointer h-8 text-accent-error hover:text-accent-error"
																onClick={() =>
																	selectedCourse && deleteChapter(selectedCourse.id, ch.id)
																}
																disabled={deletingChapterId === ch.id}
															>
																{deletingChapterId === ch.id ? '…' : 'Delete'}
															</Button>
														</div>
													</div>
												))}
										</div>
									:	<div className="text-secondary text-sm py-2">
											No chapters yet. Click &quot;Add Chapter&quot; to add one.
										</div>
									}
								</div>
								<div className="pt-4 flex gap-2">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer"
										onClick={() => openEdit(selectedCourse)}
									>
										Edit Course
									</Button>
									<SheetClose asChild>
										<Button type="button" variant="outline" className="cursor-pointer">
											Close
										</Button>
									</SheetClose>
								</div>
							</>
						:	<div className="text-secondary">No course selected.</div>}
					</div>
				</SheetContent>
			</Sheet>

			{selectedCourse && (
				<>
					<ChapterFormSheet
						open={addChapterOpen}
						onOpenChange={setAddChapterOpen}
						mode="create"
						courseId={selectedCourse.id}
						defaultOrderNo={
							selectedCourse.chapters?.length ?
								Math.max(...selectedCourse.chapters.map((c) => c.orderNo)) + 1
							:	1
						}
						onSuccess={() => refreshCourseDetail(selectedCourse.id)}
					/>
					<ChapterFormSheet
						open={editChapterOpen}
						onOpenChange={setEditChapterOpen}
						mode="edit"
						courseId={selectedCourse.id}
						chapter={chapterToEdit}
						onSuccess={() => refreshCourseDetail(selectedCourse.id)}
					/>
				</>
			)}
		</main>
	);
}
