import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/src/db/client';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';

import { createStudentSchema } from '@/validators/student.validator';
import { generateStudentPassword } from '@/utils/generate-password';
import { requireRole } from '@/utils/auth-guard';

export async function createStudent(request: NextRequest) {
	try {
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

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
		const { userId } = requireRole(request, ['student']);

		console.log('Student ID:', userId);

		if (!userId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		// Fetch student data
		const student = await prisma.student.findUnique({
			where: { id: userId },
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
			where: { studentId: userId }
		});

		// Fetch test attempts
		const testAttempts = await prisma.testAttempt.findMany({
			where: { studentId: userId },
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

export async function getStudentCourses(request: NextRequest) {
	try {
		const { userId: studentId } = requireRole(request, ['student']);
		console.log('Fetching courses for student ID:', studentId);
		if (!studentId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		// Fetch all courses enrolled by the student
		const enrollments = await prisma.enrollment.findMany({
			where: { studentId },
			include: {
				course: {
					select: {
						id: true,
						title: true
					}
				}
			}
		});

		const courses = enrollments.map((enrollment) => ({
			id: enrollment.course.id,
			title: enrollment.course.title
		}));

		const response = new ApiResponse(200, courses, 'Courses fetched successfully');
		return NextResponse.json(response);
	} catch (error) {
		return handleError('GetStudentCourses', error);
	}
}

export async function getCourseChapters(
	request: NextRequest,
	{ params }: { params: Promise<{ courseId: string }> }
) {
	try {
		const { userId: studentId } = requireRole(request, ['student']);
		const { courseId } = await params;

		if (!studentId) {
			throw new ApiError(401, 'Unauthorized access');
		}

		// Verify student is enrolled in this course
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId
				}
			}
		});

		if (!enrollment) {
			throw new ApiError(403, 'Not enrolled in this course');
		}

		// Fetch all chapters for this course
		const chapters = await prisma.chapter.findMany({
			where: { courseId },
			select: {
				id: true,
				title: true
			},
			orderBy: { orderNo: 'asc' }
		});

		const response = new ApiResponse(200, chapters, 'Chapters fetched successfully');
		return NextResponse.json(response);
	} catch (error) {
		return handleError('GetCourseChapters', error);
	}
}
