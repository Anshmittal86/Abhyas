'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import FormField from '@/components/ui/FormField';
import { handleFormBtnLoading } from '../common/HandleFormLoading';
import { useState, useEffect } from 'react';
import { createStudentSchema } from '@/lib/schemas';
import { CreateStudentFormTypes, StudentTypes, UpdateStudentFormTypes } from '@/types/student';
import { SuccessResponseTypes, CoursesListTypes } from '@/types';
import { toast } from 'sonner';
import { fetchCourses } from '@/lib/api';

type StudentFormMode = 'create' | 'update';

type StudentFormSheetProps = {
	mode?: StudentFormMode;
	studentId?: string;
	defaultValues?: Partial<CreateStudentFormTypes>;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
};

export function StudentFormSheet({
	mode = 'create',
	studentId,
	defaultValues,
	trigger,
	open,
	onOpenChange,
	onSuccess
}: StudentFormSheetProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [courses, setCourses] = useState<CoursesListTypes[]>([]);

	const loadCourses = async () => {
		setIsLoading(true);
		try {
			const data = await fetchCourses();

			if (data) {
				setCourses(data);
			} else {
				throw new Error('Failed to fetch courses data');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadCourses();
	}, [open, studentId]);

	const form = useForm<CreateStudentFormTypes>({
		resolver: zodResolver(createStudentSchema),
		defaultValues: {
			provisionalNo: '',
			name: '',
			email: '',
			mobileNo: '',
			gender: undefined,
			dob: undefined,
			fathersName: '',
			mothersName: '',
			courseId: '',
			...defaultValues
		}
	});

	const onSubmit = async (data: CreateStudentFormTypes) => {
		setIsLoading(true);
		try {
			let response;

			if (mode === 'create') {
				response = await fetch('/api/admin/student', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						provisionalNo: data.provisionalNo,
						name: data.name,
						email: data.email,
						mobileNo: data.mobileNo,
						gender: data.gender,
						fatherName: data.fathersName,
						motherName: data.mothersName,
						courseIds: data.courseId ? [data.courseId] : []
					})
				});
			} else {
				response = await fetch(`/api/admin/student/${studentId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						provisionalNo: data.provisionalNo,
						name: data.name,
						mobileNo: data.mobileNo,
						gender: data.gender,
						fatherName: data.fathersName,
						motherName: data.mothersName
					})
				});
			}

			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const result = (await response.json()) as SuccessResponseTypes<StudentTypes | null>;

			if (result.success) {
				toast.success(result.message);

				form.reset();
				onSuccess?.();
				onOpenChange?.(false);
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error('Failed to save student');
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (mode === 'create') {
			form.reset({
				provisionalNo: '',
				name: '',
				email: '',
				mobileNo: '',
				gender: undefined,
				dob: undefined,
				fathersName: '',
				mothersName: '',
				courseId: ''
			});
		} else if (mode === 'update' && defaultValues) {
			form.reset(defaultValues as UpdateStudentFormTypes);
		}
	}, [mode, defaultValues, form]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

			<SheetContent className="sm:max-w-2xl w-full overflow-y-auto bg-ab-surface">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">
						{mode === 'create' ? 'Create New Student' : 'Update Student'}
					</SheetTitle>
					<SheetDescription className="text-ab-text-secondary">
						{mode === 'create' ?
							'Fill in the details below to register a new student.'
						:	'Update the student details below.'}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-4 pt-6">
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="provisionalNo"
								label="Provisional No."
								placeholder="Enter Provisional Number"
								required
							/>
							<FormField
								control={form.control}
								name="name"
								label="Student Name"
								placeholder="Enter Student Name"
								required
							/>
						</div>

						<FormField
							control={form.control}
							name="email"
							label="Email Address"
							type="email"
							placeholder="abc@gmail.com"
						/>
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="dob"
								label="Date of Birth"
								type="datepicker"
								placeholder="DOB"
								required
							/>

							<FormField
								control={form.control}
								name="mobileNo"
								label="Mobile No."
								type="tel"
								placeholder="+91 9876543210"
							/>
						</div>

						<FormField
							control={form.control}
							name="courseId"
							label="Course"
							type="select"
							placeholder="Select Course"
							required
							options={courses.map((course) => {
								return {
									value: course.id,
									label: course.title
								};
							})}
						/>
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="fathersName"
								label="Father's Name"
								placeholder="Enter Father's Name"
								required
							/>

							<FormField
								control={form.control}
								name="mothersName"
								label="Mother's Name"
								placeholder="Enter Mother's Name"
								required
							/>
						</div>
					</div>

					<SheetFooter className="pt-6 gap-3">
						<Button
							type="submit"
							disabled={isLoading}
							className="py-4 w-full bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-sm rounded-lg shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
						>
							{handleFormBtnLoading(
								isLoading,
								mode === 'create' ? 'Create Student' : 'Update Student',
								mode === 'create' ? 'Creating Student' : 'Updating Student'
							)}
						</Button>

						<SheetClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={isLoading}
								className="py-4 w-full font-bold text-sm rounded-lg transition-all active:scale-95 cursor-pointer border border-ab-border text-ab-text-primary hover:bg-ab-primary/5"
							>
								Cancel
							</Button>
						</SheetClose>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
