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
import { toast } from 'sonner';
import { createCourseSchema } from '@/lib/schemas/course';
import { CreateCourseFormTypes } from '@/types';

type CourseFormMode = 'create' | 'update';

type CourseFormSheetProps = {
	mode?: CourseFormMode;
	defaultValues?: Partial<CreateCourseFormTypes>;
	courseId?: string;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
	onClose?: () => void;
};

const durationOptions = [
	{ value: '1 Month', label: '1 Month' },
	{ value: '2 Month', label: '2 Month' },
	{ value: '3 Month', label: '3 Month' },
	{ value: '6 Month', label: '6 Month' },
	{ value: '1 Year', label: '1 Year' },
	{ value: '2 Year', label: '2 Year' }
];

export function CourseFormSheet({
	mode = 'create',
	defaultValues,
	courseId,
	trigger,
	open,
	onOpenChange,
	onSuccess,
	onClose
}: CourseFormSheetProps) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CreateCourseFormTypes>({
		resolver: zodResolver(createCourseSchema), // You'll need to define this schema
		defaultValues: {
			title: '',
			description: '',
			duration: '',
			...defaultValues
		}
	});

	const onSubmit = async (data: CreateCourseFormTypes) => {
		setIsLoading(true);
		try {
			let response;

			if (mode === 'create') {
				response = await fetch('/api/admin/course', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify(data)
				});
			} else {
				response = await fetch(`/api/admin/course/${courseId}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify(data)
				});
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				toast.success(result.message);
				form.reset();
				onSuccess?.();
			} else {
				throw new Error(result.message || 'Failed to save course');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to save course';
			toast.error(errorMessage);
			console.error('Course form submit error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (mode === 'create') {
			form.reset({
				title: '',
				description: '',
				duration: ''
			});
		} else if (mode === 'update' && defaultValues) {
			form.reset(defaultValues as CreateCourseFormTypes);
		}
	}, [mode, defaultValues, form]);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

			<SheetContent className="sm:max-w-2xl w-full overflow-y-auto bg-ab-surface">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">
						{mode === 'create' ? 'Create New Course' : 'Update Course'}
					</SheetTitle>
					<SheetDescription className="text-ab-text-secondary">
						{mode === 'create' ?
							'Fill in the course details below to create a new course.'
						:	'Update the course information below.'}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="grid gap-6 pt-6">
						<FormField
							control={form.control}
							name="title"
							label="Course Title"
							placeholder="Enter course title (e.g., Web Development)"
							required
						/>

						<FormField
							control={form.control}
							name="description"
							label="Description"
							type="textarea"
							placeholder="Enter course description (optional)"
							rows={3}
						/>

						<FormField
							control={form.control}
							name="duration"
							label="Duration"
							type="select"
							placeholder="Select course duration"
							required
							options={durationOptions}
						/>
					</div>

					<SheetFooter className="pt-6 gap-3">
						<Button
							type="submit"
							disabled={isLoading}
							className="py-4 w-full bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-sm rounded-lg shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
						>
							{handleFormBtnLoading(
								isLoading,
								mode === 'create' ? 'Create Course' : 'Update Course',
								mode === 'create' ? 'Creating Course...' : 'Updating Course...'
							)}
						</Button>

						<SheetClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={isLoading}
								className="py-4 w-full font-bold text-sm rounded-lg transition-all active:scale-95 cursor-pointer border border-ab-border text-ab-text-primary hover:bg-ab-primary/5"
								onClick={onClose}
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
