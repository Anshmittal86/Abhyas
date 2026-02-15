import { createCourseSchema } from '@/lib/schemas/course';
import z from 'zod';

export type CoursesListTypes = {
	id: string;
	title: string;
	description: string;
	duration: string;
	isActive: boolean;
	enrollmentCount: number;
	createdAt: string;
};

export interface CourseTypes {
	id: string;
	title: string;
	description: string | null;
	duration: string | null;
	isActive: boolean;
	createdAt: string;
	admin: {
		id: string;
		name: string;
		email: string;
	};
	enrollments: {
		id: string;
		enrolledAt: string;
		student: {
			id: string;
			provisionalNo: string;
			name: string;
			email: string;
			isActive: boolean;
			registeredAt: string;
		};
	}[];
	chapters: {
		id: string;
		title: string;
	}[];
}

export interface toggleCourseActivateType {
	id: string;
	isActive: boolean;
	title: string;
}

export type CreateCourseFormTypes = z.infer<typeof createCourseSchema>;
