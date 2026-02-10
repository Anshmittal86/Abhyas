import { z } from 'zod';
import { GenderEnum } from './enums';

export const createStudentSchema = z.object({
	provisionalNo: z.string().min(3, 'Provisional number is required').max(20),
	name: z.string().min(2, 'Name Must be at least 2 characters'),
	email: z.email('Invalid email address'),
	mobileNo: z.string().optional(),
	gender: GenderEnum.optional(),
	dob: z.date('Date of birth is required'),
	course: z.string('Course is required'),
	fathersName: z.string().optional(),
	mothersName: z.string().optional()
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentForm = z.infer<typeof createStudentSchema>;
export type UpdateStudentForm = z.infer<typeof updateStudentSchema>;
