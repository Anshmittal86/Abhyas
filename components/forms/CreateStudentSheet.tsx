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
import { useState } from 'react';
import { CreateStudentForm, createStudentSchema } from '@/lib/schemas';
import { UserPlus } from 'lucide-react';

const courses = [
	{ value: 'btech', label: 'B.Tech' },
	{ value: 'bsc', label: 'B.Sc' },
	{ value: 'bca', label: 'BCA' },
	{ value: 'ba', label: 'BA' },
	{ value: 'bcom', label: 'B.Com' },
	{ value: 'mtech', label: 'M.Tech' },
	{ value: 'msc', label: 'M.Sc' },
	{ value: 'mca', label: 'MCA' }
];

export function CreateStudentSheet({ classes = '' }) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CreateStudentForm>({
		resolver: zodResolver(createStudentSchema),
		defaultValues: {
			provisionalNo: '',
			name: '',
			email: '',
			mobileNo: '',
			gender: undefined,
			dob: undefined,
			course: '',
			fathersName: '',
			mothersName: ''
		}
	});

	const onSubmit = async (data: CreateStudentForm) => {
		setIsLoading(true);
		try {
			console.log('Creating student:', data);
			await new Promise((resolve) => setTimeout(resolve, 2000));
			form.reset();
			console.log('Student created successfully!');
		} catch (error) {
			console.error('Failed to create student:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer ${classes}`}
				>
					<UserPlus className="h-5 w-5" />
					Create Student
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-2xl w-full overflow-y-auto bg-ab-surface">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">Create New Student</SheetTitle>
					<SheetDescription className="text-ab-text-secondary">
						Fill in the details below to register a new student.
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
							name="course"
							label="Course"
							type="select"
							placeholder="Select Course"
							required
							options={courses}
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
							{handleFormBtnLoading(isLoading, 'Create Student', 'Creating Student')}
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
