import { z } from 'zod';

export const createStudentSchema = z.object({
	provisionalNo: z.string().min(3, 'Provisional no is required'),
	name: z.string().min(3, 'Student name is required'),
	email: z.email('Invalid email'),
	mobileNo: z.string().optional(),

	gender: z.enum(['male', 'female', 'other']).optional(),
	dob: z.string().optional(), // ISO string
	fatherName: z.string().optional(),
	motherName: z.string().optional(),

	courseIds: z.array(z.uuid()).min(1, 'At least one course is required').optional()
});

export const updateStudentSchema = z.object({
	name: z.string().min(3, 'Student name is required').optional(),
	mobileNo: z.string().optional(),
	gender: z.enum(['male', 'female', 'other']).optional(),
	dob: z.string().optional(), // ISO string
	fatherName: z.string().optional(),
	motherName: z.string().optional(),
	isActive: z.boolean().optional()
});

export const enrollStudentSchema = z.object({
	courseId: z.uuid('Invalid course id')
});
