'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CourseFormSheet } from '@/components/forms/CourseFormSheet'; // You'll need to create this
import AlertDialogBox from '@/components/common/AlertDialogBox';
import { Eye, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';
import { CourseTypes, SuccessResponseTypes } from '@/types';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	courseId: string | null;
	onDeactivate: (id: string) => void;
};

export default function CourseViewSheet({ open, onOpenChange, courseId, onDeactivate }: Props) {
	const [course, setCourse] = useState<CourseTypes | null>(null);
	const [deactivating, setDeactivating] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || !courseId) return;

		const fetchCourse = async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/admin/course/${courseId}`, {
					method: 'GET',
					credentials: 'include'
				});

				const result = (await res.json()) as SuccessResponseTypes<CourseTypes>;
				if (!result?.success) {
					setCourse(null);
					return;
				}
				setCourse(result.data || null);
			} catch (error) {
				console.error(error);
				setCourse(null);
			} finally {
				setLoading(false);
			}
		};

		fetchCourse();
	}, [courseId, open]);

	useEffect(() => {
		if (!open) {
			setCourse(null);
		}
	}, [open]);

	if (loading) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<Loader size={35} height="full" showIcon message="Loading Course Details..." />
				</SheetContent>
			</Sheet>
		);
	}

	if (!course) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<p className="text-center text-ab-text-secondary py-10">Course data not available</p>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">Course Details</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-8">
					{/* Course Header */}
					<div className="space-y-1">
						<p className="text-2xl font-black text-ab-text-primary">{course?.title}</p>
						<p className="text-sm font-bold text-ab-primary">
							Duration: {course?.duration || 'Not Specified'}
						</p>
						<p className="text-sm text-ab-text-secondary">
							Created on{' '}
							{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
						</p>
					</div>

					{/* Basic Info */}
					<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border p-4">
						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Status</p>
							<p className="font-black">{course?.isActive ? 'Active' : 'Deactivated'}</p>
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Admin</p>
							<p className="font-black">{course?.admin?.name}</p>
						</div>

						<div className="col-span-2">
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Description</p>
							<p className="font-black mt-1">{course?.description || 'No description provided'}</p>
						</div>
					</div>

					{/* Enrollments */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Enrollments ({course?.enrollments?.length ?? 0})
						</p>

						{course?.enrollments?.length === 0 && (
							<p className="text-sm text-ab-text-secondary">No enrollments found</p>
						)}

						{course?.enrollments?.map((en) => (
							<div
								key={en.id}
								className="flex justify-between items-center p-3 bg-ab-surface/50 rounded-lg"
							>
								<div className="flex-1 min-w-0">
									<p className="font-black truncate">{en.student.name}</p>
									<p className="text-xs text-ab-text-secondary truncate">{en.student.email}</p>
									<p className="text-xs text-ab-text-secondary">{en.student.provisionalNo}</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-ab-text-secondary">
										{new Date(en.enrolledAt).toLocaleDateString()}
									</p>
									<p className="font-black text-xs">{en.student.isActive ? 'Active' : 'Blocked'}</p>
								</div>
							</div>
						))}
					</div>

					{/* Chapters */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Chapters ({course?.chapters?.length ?? 0})
						</p>

						{course?.chapters?.length === 0 && (
							<p className="text-sm text-ab-text-secondary">No chapters created yet</p>
						)}

						{course?.chapters?.map((chapter) => (
							<div
								key={chapter.id}
								className="flex justify-between text-sm p-2 bg-ab-surface/50 rounded"
							>
								<span className="font-black">{chapter.title}</span>
							</div>
						))}
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-2 pt-4">
						<CourseFormSheet
							mode="update"
							courseId={course?.id}
							defaultValues={{
								title: course?.title ?? '',
								description: course?.description ?? '',
								duration: course?.duration ?? ''
							}}
							trigger={
								<Button variant="outline" className="font-bold flex-1 sm:flex-none">
									<Edit3 className="h-4 w-4 mr-2" />
									Update Course
								</Button>
							}
						/>

						{!course.isActive && (
							<AlertDialogBox
								name={course?.title || ''}
								onConfirm={async () => {
									if (!course) return;
									try {
										setDeactivating(true);
										await onDeactivate(course.id);
										setCourse((prev) => (prev ? { ...prev, isActive: true } : prev));
									} finally {
										setDeactivating(false);
									}
								}}
								trigger={
									<Button
										variant="outline"
										disabled={deactivating}
										className="font-bold text-ab-green-text flex-1 sm:flex-none"
									>
										Activate Course
									</Button>
								}
							/>
						)}

						{course.isActive && (
							<AlertDialogBox
								name={course?.title || ''}
								onConfirm={async () => {
									if (!course) return;
									try {
										setDeactivating(true);
										await onDeactivate(course.id);
										setCourse((prev) => (prev ? { ...prev, isActive: false } : prev));
									} finally {
										setDeactivating(false);
									}
								}}
								trigger={
									<Button
										variant="outline"
										disabled={deactivating}
										className="font-bold text-ab-pink-text flex-1 sm:flex-none"
									>
										Deactivate Course
									</Button>
								}
							/>
						)}

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
