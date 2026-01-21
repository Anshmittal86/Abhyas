import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/src/db/client';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createStudentSchema } from '@/validators/student.validator';
import { generateStudentPassword } from '@/utils/generate-password';

export async function createStudent(request: NextRequest) {
	try {
		const adminId = request.headers.get('x-user-id');
		const role = request.headers.get('x-user-role');

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized');
		}

		const body = await request.json();
		const { provisionalNo, name, email, mobileNo, gender, dob, fatherName, motherName, courseIds } =
			createStudentSchema.parse(body);

		// ✅ Prevent duplicates
		const existing = await prisma.student.findFirst({
			where: {
				OR: [{ email }, { provisionalNo }]
			}
		});

		if (existing) {
			throw new ApiError(409, 'Student already exists with same email or provisional no');
		}

		// 🔐 Generate password & hash it
		const plainPassword = generateStudentPassword(10);
		const SALT_ROUND = Number(process.env.SALT_ROUND || 10);
		const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUND);

		// ✅ Create student + enrollments (transaction)
		const student = await prisma.$transaction(async (tx) => {
			const createdStudent = await tx.student.create({
				data: {
					provisionalNo,
					name,
					email,
					mobileNo,
					gender,
					dob: dob ? new Date(dob) : null,
					fatherName,
					motherName,
					password: hashedPassword
				}
			});

			if (courseIds?.length) {
				await tx.enrollment.createMany({
					data: courseIds.map((courseId) => ({
						studentId: createdStudent.id,
						courseId
					})),
					skipDuplicates: true
				});
			}

			return createdStudent;
		});

		logEvent('StudentCreated', {
			adminId,
			studentId: student.id,
			provisionalNo,
			email
		});

		// ✅ Return student + plain password (only once)
		return NextResponse.json(
			new ApiResponse(
				201,
				{
					studentId: student.id,
					provisionalNo: student.provisionalNo,
					name: student.name,
					email: student.email,
					generatedPassword: plainPassword
				},
				'Student created successfully'
			),
			{ status: 201 }
		);
	} catch (error) {
		return handleError('CreateStudent', error);
	}
}

export async function getStudentDashboard(request: NextRequest) {
	try {
		// Get student ID from headers or auth context
		const studentId = request.headers.get('x-user-id');

		console.log('Student ID:', studentId);

		if (!studentId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		// Fetch student data
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: {
				id: true,
				name: true,
				email: true,
				provisionalNo: true
			}
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// Fetch enrollments count
		const enrolledCourses = await prisma.enrollment.count({
			where: { studentId }
		});

		// Fetch test attempts
		const testAttempts = await prisma.testAttempt.findMany({
			where: { studentId },
			include: { test: true }
		});

		// Calculate statistics
		const completedTests = testAttempts.filter((attempt) => attempt.submittedAt).length;
		const pendingTests = testAttempts.filter((attempt) => !attempt.submittedAt).length;

		// Calculate average score
		const scores = testAttempts
			.filter((attempt) => attempt.score !== null)
			.map((attempt) => attempt.score as number);
		const averageScore =
			scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

		const response = new ApiResponse(
			200,
			{
				student,
				enrolledCourses,
				completedTests,
				averageScore,
				pendingTests
			},
			'Dashboard data fetched successfully'
		);

		return NextResponse.json(response);
	} catch (error) {
		return handleError('StudentDashboard', error);
	}
}
