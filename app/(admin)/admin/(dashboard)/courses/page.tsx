'use client';

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, BookPlus } from 'lucide-react';
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

type Course = {
	id: string;
	title: string;
	description: string;
	duration: string;
	isActive: boolean;
	enrollmentCount: number;
	createdAt: string;
};

type ApiResponse = {
	statusCode: number;
	data: Course[];
	message: string;
	success: boolean;
};

export default function AdminCoursesPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('search') || '';
	const [updateCourseId, setUpdateCourseId] = useState<string | null>(null);
	const [updateOpen, setUpdateOpen] = useState(false);

	// Fetch courses on mount
	useEffect(() => {
		fetchCourses();
	}, []);

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

	const fetchCourses = async () => {
		try {
			// -----------------------------
			// UI BRANCH MOCK DATA START
			// -----------------------------

			setCourses([
				{
					id: '3a9b58dd-1a3b-424c-ab72-a00269a7fabe',
					title: 'GenAI',
					description: 'Generative AI Course with Python',
					duration: '3 Month',
					isActive: true,
					enrollmentCount: 0,
					createdAt: '2026-02-12T06:24:30.778Z'
				},
				{
					id: '55ffa0ed-c72a-4619-81f6-bef5b755d03d',
					title: 'CCC',
					description: 'NIELIT Authorized Course.',
					duration: '3 Month',
					isActive: true,
					enrollmentCount: 0,
					createdAt: '2026-02-12T06:03:06.640Z'
				}
			]);

			// -----------------------------
			// UI BRANCH MOCK DATA END
			// -----------------------------
			// TODO: Uncomment this in the main branch
			// setLoading(true);
			// setError(null);
			// const response = await fetch('/api/admin/course', {
			// 	method: 'GET',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	credentials: 'include'
			// });
			// if (!response.ok) {
			// 	throw new Error(`HTTP error! status: ${response.status}`);
			// }
			// const result: ApiResponse = await response.json();
			// if (result.success) {
			// 	setCourses(result.data);
			// 	setFilteredCourses(result.data);
			// } else {
			// 	throw new Error(result.message || 'Failed to fetch courses');
			// }
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
			setError(errorMessage);
			toast.error(errorMessage);
			console.error('Fetch courses error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const params = new URLSearchParams(searchParams);
		if (e.target.value) {
			params.set('search', e.target.value);
		} else {
			params.delete('search');
		}
		window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
	};

	const handleDeleteCourse = async (courseId: string) => {
		try {
			// TODO: Uncomment this in the main branch
			// const response = await fetch(`/api/admin/course/${courseId}`, {
			// 	method: 'DELETE',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	credentials: 'include'
			// });
			// if (!response.ok) {
			// 	throw new Error(`HTTP error! status: ${response.status}`);
			// }
			// const result: ApiResponse = await response.json();
			// if (result.success) {
			// 	toast.success(result.message);
			// 	fetchCourses();
			// } else {
			// 	throw new Error(result.message || 'Failed to delete course');
			// }
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
			toast.error(errorMessage);
			console.error('Delete course error:', error);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
				<Loader message="Loading courses..." />
			</div>
		);
	}

	if (error && courses.length === 0) {
		return (
			<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-black tracking-tight">Courses</h2>
						<p className="text-sm font-medium italic text-ab-text-secondary">
							Manage courses and track enrollment activity.
						</p>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center min-h-100 text-center p-8 rounded-[22px] border-2 border-ab-border/80 bg-ab-surface">
					<Loader showIcon={false} message="Failed to load courses" subtitle={error} />
					<Button
						onClick={fetchCourses}
						className="mt-6 py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
					>
						Retry
					</Button>
				</div>
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
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search by course name..."
						className="h-11 rounded-xl border-2 border-ab-border/80 pl-10 focus-visible:ring-ab-primary/20"
						defaultValue={searchQuery}
						onChange={handleSearch}
					/>
				</div>

				<CourseFormSheet
					mode="create"
					onSuccess={fetchCourses}
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
				{filteredCourses.length === 0 ?
					<div className="p-12 text-center">
						<p className="text-lg font-black text-ab-text-primary mb-2">
							{searchQuery ? 'No matching courses found' : 'No courses available'}
						</p>
						<p className="text-sm text-ab-text-secondary">
							{searchQuery ?
								`Try adjusting your search for "${searchQuery}"`
							:	'Create your first course to get started'}
						</p>
					</div>
				:	<Table>
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
							{filteredCourses.map((course) => (
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
												<DropdownMenuItem className="cursor-pointer font-bold flex justify-center">
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
							))}
						</TableBody>
					</Table>
				}
			</div>

			{/* Create and update form sheet  */}
			<CourseFormSheet
				mode={updateCourseId ? 'update' : 'create'}
				courseId={updateCourseId || undefined}
				defaultValues={courses.find((c) => c.id === updateCourseId) || undefined}
				open={updateOpen}
				onOpenChange={setUpdateOpen}
				onSuccess={() => {
					fetchCourses();
					setUpdateOpen(false);
				}}
			/>
		</div>
	);
}
