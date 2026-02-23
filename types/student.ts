import { createStudentSchema } from '@/lib/schemas';
import z from 'zod';

export interface StudentsListTypes {
	id: string;
	provisionalNo: string;
	name: string;
	email: string;
	mobileNo: string;
	gender: string;
	isActive: boolean;
	enrollmentCount: number;
	testAttemptCount: number;
	registeredAt: string;
}

export interface StudentTypes {
	id: string;
	provisionalNo: string;
	name: string;
	email: string;
	mobileNo: string;
	gender: string;
	dob: string | null;
	fatherName: string;
	motherName: string;
	isActive: boolean;
	registeredAt: string;
	enrollments: {
		id: string;
		courseId: string;
		course: {
			id: string;
			title: string;
		};
		enrolledAt: string;
	}[];
	testAttempts: {
		id: string;
		testId: string;
		test: {
			id: string;
			title: string;
		};
		startedAt: string;
		submittedAt: string;
		score: number;
	}[];
}

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentFormTypes = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormTypes = z.infer<typeof updateStudentSchema>;
