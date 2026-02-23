'use client';

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, BookPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { CourseFormSheet } from '@/components/forms/CourseFormSheet';
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
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/common/Loader';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import { fetchCourses } from '@/lib/api';
import { SuccessResponseTypes, CoursesListTypes, toggleCourseActivateType } from '@/types';
import { EmptyCourses } from '@/components/admin/courses/EmptyCourses';
import CourseViewSheet from '@/components/admin/courses/CourseViewSheet';

export default function AdminCoursesPage() {
	const [courses, setCourses] = useState<CoursesListTypes[]>([]);
	const [filteredCourses, setFilteredCourses] = useState<CoursesListTypes[]>([]);
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('search') || '';
	const [updateCourseId, setUpdateCourseId] = useState<string | null>(null);
	const [updateOpen, setUpdateOpen] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	// Filter courses when search query changes
	useEffect(() => {
		if (searchQuery) {
			const filtered = courses.filter(
				(course) =>
					course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					course.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredCourses(filtered);
		} else {
			setFilteredCourses(courses);
		}
	}, [searchQuery, courses]);

	const loadCourses = async () => {
		setLoading(true);
		try {
			const data = await fetchCourses();

			if (data) {
				setCourses(data);
				setFilteredCourses(data);
			} else {
				throw new Error('Failed to fetch courses data');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCourses();
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

	const handleDeleteCourse = async (courseId: string) => {
		try {
			const response = await fetch(`/api/admin/course/${courseId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = (await response.json()) as SuccessResponseTypes<null>;
			if (result.message) {
				toast.success(result.message || 'Course deleted successfully');
				await loadCourses();
			} else {
				throw new Error(result.message || 'Failed to delete course');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
			toast.error(errorMessage);
			console.error('Delete course error:', error);
		}
	};

	const handleDeactivateCourse = async (courseId: string) => {
		try {
			const res = await fetch(`/api/admin/course/${courseId}/deactivate`, {
				method: 'POST',
				credentials: 'include'
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const result = (await res.json()) as SuccessResponseTypes<toggleCourseActivateType>;

			if (!result.success) {
				throw new Error(result.message || 'Failed to update course status');
			}

			if (result.success) {
				// Update specific course in state
				setCourses((prev) =>
					prev.map((course) =>
						course.id === courseId ? { ...course, isActive: !course.isActive } : course
					)
				);
				setFilteredCourses((prev) =>
					prev.map((course) =>
						course.id === courseId ? { ...course, isActive: !course.isActive } : course
					)
				);

				toast.success(result.message || 'Successfully update the course status');
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to update course status';
			toast.error(errorMessage);
			console.error('Update course status error:', error);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
				<Loader message="Loading courses..." />
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-black tracking-tight">Courses</h2>
					<p className="text-sm font-medium italic text-ab-text-secondary">
						Manage courses and track enrollment activity.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex justify-between items-center gap-4">
				<div className="relative w-full max-w-sm group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ab-text-secondary" />
					<Input
						placeholder="Search by course name..."
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

				<CourseFormSheet
					mode="create"
					onSuccess={loadCourses}
					trigger={
						<Button
							variant="outline"
							className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer `}
						>
							<BookPlus className="h-5 w-5" />
							Create Course
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
								Course
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Duration
							</TableHead>
							<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
								Enrollments
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Status
							</TableHead>
							<TableHead className="pr-8 text-right text-[11px] font-black uppercase tracking-widest">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ?
							<TableRow>
								<TableCell colSpan={5} className="text-center py-10">
									<Loader size={30} showIcon message="Loading courses..." />
								</TableCell>
							</TableRow>
						: courses.length === 0 ?
							<TableRow>
								<TableCell colSpan={5}>
									<EmptyCourses />
								</TableCell>
							</TableRow>
						:	filteredCourses.map((course) => (
								<TableRow key={course.id} className="group transition-colors hover:bg-ab-primary/5">
									<TableCell className="py-5 pl-8">
										<div className="flex flex-col max-w-md">
											<span className="text-[15px] font-black">{course.title}</span>
											{course.description && (
												<span className="text-[11px] font-bold text-ab-text-secondary line-clamp-2">
													{course.description}
												</span>
											)}
											<span className="text-[11px] font-medium text-ab-text-secondary mt-1">
												Created: {new Date(course.createdAt).toLocaleDateString()}
											</span>
										</div>
									</TableCell>

									<TableCell className="font-bold">{course.duration}</TableCell>

									<TableCell className="text-center font-black">{course.enrollmentCount}</TableCell>

									<TableCell>
										<Badge
											className={`rounded-lg border-none px-3 py-1 font-bold shadow-none ${
												course.isActive ?
													'bg-ab-green-bg text-ab-green-text'
												:	'bg-ab-pink-bg text-ab-pink-text'
											}`}
										>
											{course.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</TableCell>

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
													onClick={() => {
														setSelectedCourseId(course.id);
														setIsOpen(true);
													}}
												>
													View Course
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer font-bold flex justify-center"
													onClick={() => {
														setUpdateCourseId(course.id);
														setUpdateOpen(true);
													}}
												>
													Update Course
												</DropdownMenuItem>

												<AlertDialogBox
													name={course.title}
													onConfirm={() => handleDeleteCourse(course.id)}
													trigger={
														<Button
															variant="ghost"
															className="w-full flex justify-center font-bold text-ab-pink-text hover:bg-ab-pink-bg/50 h-8 px-2"
														>
															Delete Course
														</Button>
													}
													title="Delete this course?"
													description={`Permanently delete "${course.title}"? This action cannot be undone.`}
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

			{/* Create and update form sheet  */}
			<CourseFormSheet
				mode={updateCourseId ? 'update' : 'create'}
				courseId={updateCourseId || undefined}
				defaultValues={courses.find((c) => c.id === updateCourseId) || undefined}
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				onSuccess={() => {
					loadCourses();
					setUpdateOpen(false);
				}}
			/>

			<CourseViewSheet
				open={isOpen}
				onOpenChange={setIsOpen}
				courseId={selectedCourseId}
				onDeactivate={handleDeactivateCourse}
			/>
		</div>
	);
}
