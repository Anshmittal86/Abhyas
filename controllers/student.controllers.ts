import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/src/db/client';
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { handleApiError as handleError } from '@/utils/handle-error';
import { logEvent } from '@/utils/log-event';
import { sendEmail, renderStudentEmail } from '@/utils/mail.js';

import {
	createStudentSchema,
	updateStudentSchema,
	enrollStudentSchema
} from '@/validators/student.validator';
import { generateStudentPassword } from '@/utils/generate-password';
import { requireRole } from '@/utils/auth-guard';

export async function getStudentDashboard(request: NextRequest) {
	try {
		// Get student ID from headers or auth context
		const { userId } = requireRole(request, ['student']);

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

		// enrolled courses
		const enrollments = await prisma.enrollment.findMany({
			where: { studentId: userId },
			select: {
				course: {
					select: {
						id: true,
						title: true,
						duration: true,
						chapters: {
							select: {
								id: true,
								code: true,
								title: true,
								tests: {
									select: {
										id: true,
										title: true,
										durationMinutes: true,
										createdAt: true
									}
								}
							}
						}
					}
				}
			}
		});

		// Student All Tests
		const allTests = enrollments.flatMap((enrollment) =>
			enrollment.course.chapters.flatMap((chapter) =>
				chapter.tests.map((test) => ({
					...test,
					courseTitle: enrollment.course.title,
					chapterTitle: chapter.title,
					chapterCode: chapter.code
				}))
			)
		);

		// attempts
		const attempts = await prisma.testAttempt.findMany({
			where: { studentId: userId },
			orderBy: { startedAt: 'desc' }
		});

		const completedAttempts = attempts.filter((attempt) => attempt.status === 'COMPLETED');

		const completedTestIds = new Set(completedAttempts.map((attempt) => attempt.testId));

		const pendingTests = allTests.filter((test) => !completedTestIds.has(test.id));

		const completedAttemptsTotalScore = completedAttempts.reduce((total, attempt) => {
			return total + (attempt.score ?? 0);
		}, 0);

		const totalCompletedAttempts = completedAttempts.length;

		const averageScore =
			totalCompletedAttempts > 0 ?
				Math.round(completedAttemptsTotalScore / totalCompletedAttempts)
			:	0;

		// next action = first pending test
		const nextPendingTest =
			pendingTests.sort(
				(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)[0] ?? null;

		// recent activity
		const lastAttempt =
			completedAttempts.sort(
				(a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()
			)[0] ?? null;

		const response = new ApiResponse(
			200,
			{
				student,
				stats: {
					enrolledCourses: enrollments.length,
					totalTests: allTests.length,
					completedTests: totalCompletedAttempts,
					pendingTests: pendingTests.length,
					averageScore
				},
				nextAction:
					nextPendingTest ?
						{
							type: 'TEST',
							testId: nextPendingTest.id,
							title: nextPendingTest.title,
							durationMinutes: nextPendingTest.durationMinutes
						}
					:	null,
				recentActivity:
					lastAttempt ?
						{
							testId: lastAttempt.testId,
							score: lastAttempt.score,
							submittedAt: lastAttempt.submittedAt
						}
					:	null
			},
			'Dashboard data fetched'
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

// 📋 ADMIN APIs - Student Management

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
		const newStudent = await prisma.$transaction(async (tx) => {
			const student = await tx.student.create({
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
						studentId: student.id,
						courseId
					})),
					skipDuplicates: true
				});
			}

			return student;
		});

		// Sending Email
		const loginLink = `${process.env.FRONTEND_URL}/student-login?provisionalNo=${encodeURIComponent(newStudent.provisionalNo)}`;

		const html = renderStudentEmail({
			name: newStudent.name,
			provisionalNo: newStudent.provisionalNo,
			password: plainPassword,
			loginLink
		});

		await sendEmail({
			email: newStudent.email,
			subject: 'Student Account Created Successfully',
			html,
			text: `Provisional No: ${newStudent.provisionalNo}`
		});

		logEvent('StudentCreated', {
			adminId,
			studentId: newStudent.id,
			provisionalNo,
			email
		});

		// ✅ Return student + plain password (only once)
		return NextResponse.json(
			new ApiResponse(
				201,
				{
					studentId: newStudent.id,
					provisionalNo: newStudent.provisionalNo,
					name: newStudent.name,
					email: newStudent.email,
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

export async function getStudents(request: NextRequest) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		// 📊 Fetch all students with enrollment count
		const students = await prisma.student.findMany({
			select: {
				id: true,
				provisionalNo: true,
				name: true,
				email: true,
				mobileNo: true,
				gender: true,
				isActive: true,
				registeredAt: true,
				_count: {
					select: {
						enrollments: true,
						testAttempts: true
					}
				}
			},
			orderBy: {
				registeredAt: 'desc'
			}
		});

		// 📈 Format response with counts
		const formattedStudents = students.map((student) => ({
			id: student.id,
			provisionalNo: student.provisionalNo,
			name: student.name,
			email: student.email,
			mobileNo: student.mobileNo,
			gender: student.gender,
			isActive: student.isActive,
			enrollmentCount: student._count.enrollments,
			testAttemptCount: student._count.testAttempts,
			registeredAt: student.registeredAt
		}));

		return NextResponse.json(
			new ApiResponse(200, formattedStudents, 'Students fetched successfully'),
			{ status: 200 }
		);
	} catch (error) {
		return handleError('GetStudents', error);
	}
}

export async function getStudentById(
	request: NextRequest,
	{ params }: { params: Promise<{ studentId: string }> }
) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId } = await params;

		if (!studentId) {
			throw new ApiError(400, 'Student ID is required');
		}

		// 📌 Fetch student with all details
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: {
				id: true,
				provisionalNo: true,
				name: true,
				email: true,
				mobileNo: true,
				gender: true,
				dob: true,
				fatherName: true,
				motherName: true,
				isActive: true,
				registeredAt: true,
				enrollments: {
					select: {
						id: true,
						courseId: true,
						course: {
							select: {
								id: true,
								title: true
							}
						},
						enrolledAt: true
					}
				},
				testAttempts: {
					select: {
						id: true,
						testId: true,
						test: {
							select: {
								id: true,
								title: true
							}
						},
						startedAt: true,
						submittedAt: true,
						score: true
					},
					orderBy: {
						startedAt: 'desc'
					},
					take: 10 // Last 10 attempts
				}
			}
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		return NextResponse.json(new ApiResponse(200, student, 'Student fetched successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('GetStudentById', error);
	}
}

export async function updateStudent(
	request: NextRequest,
	{ params }: { params: Promise<{ studentId: string }> }
) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId } = await params;

		if (!studentId) {
			throw new ApiError(400, 'Student ID is required');
		}

		// ✅ Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId }
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { name, mobileNo, gender, dob, fatherName, motherName, isActive } =
			updateStudentSchema.parse(body);

		// 🧠 Update student (only provided fields)
		const updatedStudent = await prisma.student.update({
			where: { id: studentId },
			data: {
				...(name !== undefined && { name }),
				...(mobileNo !== undefined && { mobileNo }),
				...(gender !== undefined && { gender }),
				...(dob !== undefined && { dob: dob ? new Date(dob) : null }),
				...(fatherName !== undefined && { fatherName }),
				...(motherName !== undefined && { motherName }),
				...(isActive !== undefined && { isActive })
			},
			select: {
				id: true,
				provisionalNo: true,
				name: true,
				email: true,
				mobileNo: true,
				gender: true,
				dob: true,
				fatherName: true,
				motherName: true,
				isActive: true,
				registeredAt: true
			}
		});

		// 🧾 Audit log
		logEvent('StudentUpdated', {
			adminId,
			studentId: updatedStudent.id,
			provisionalNo: updatedStudent.provisionalNo,
			email: updatedStudent.email
		});

		return NextResponse.json(new ApiResponse(200, updatedStudent, 'Student updated successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('UpdateStudent', error);
	}
}

export async function deleteStudent(
	request: NextRequest,
	{ params }: { params: Promise<{ studentId: string }> }
) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId } = await params;

		if (!studentId) {
			throw new ApiError(400, 'Student ID is required');
		}

		// ✅ Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			select: {
				id: true,
				provisionalNo: true,
				email: true,
				enrollments: {
					select: { courseId: true }
				}
			}
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// 🗑️ Delete student (cascades to enrollments, testAttempts, attemptAnswers, refreshTokens)
		await prisma.student.delete({
			where: { id: studentId }
		});

		// 🧾 Audit log
		logEvent('StudentDeleted', {
			adminId,
			studentId: student.id,
			provisionalNo: student.provisionalNo,
			email: student.email,
			enrollmentCount: student.enrollments.length
		});

		return NextResponse.json(new ApiResponse(200, null, 'Student deleted successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('DeleteStudent', error);
	}
}

export async function enrollStudent(
	request: NextRequest,
	{ params }: { params: Promise<{ studentId: string }> }
) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId } = await params;

		if (!studentId) {
			throw new ApiError(400, 'Student ID is required');
		}

		// ✅ Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId }
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// 📦 Parse & validate request body
		const body = await request.json();
		const { courseId } = enrollStudentSchema.parse(body);

		// ✅ Verify course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		// ✅ Check if already enrolled
		const existingEnrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId
				}
			}
		});

		if (existingEnrollment) {
			throw new ApiError(409, 'Student already enrolled in this course');
		}

		// 🔗 Create enrollment
		const enrollment = await prisma.enrollment.create({
			data: {
				studentId,
				courseId
			},
			select: {
				id: true,
				studentId: true,
				courseId: true,
				enrolledAt: true,
				course: {
					select: {
						id: true,
						title: true
					}
				}
			}
		});

		// 🧾 Audit log
		logEvent('StudentEnrolled', {
			adminId,
			studentId,
			courseId,
			enrollmentId: enrollment.id
		});

		return NextResponse.json(
			new ApiResponse(
				201,
				{
					enrollmentId: enrollment.id,
					studentId: enrollment.studentId,
					courseId: enrollment.courseId,
					courseTitle: enrollment.course.title,
					enrolledAt: enrollment.enrolledAt
				},
				'Student enrolled successfully'
			),
			{ status: 201 }
		);
	} catch (error) {
		return handleError('EnrollStudent', error);
	}
}

export async function unenrollStudent(
	request: NextRequest,
	{ params }: { params: Promise<{ studentId: string; courseId: string }> }
) {
	try {
		// 🔐 Admin authorization
		const { userId: adminId, userRole: role } = requireRole(request, ['admin']);

		if (!adminId || role !== 'admin') {
			throw new ApiError(401, 'Unauthorized access');
		}

		const { studentId, courseId } = await params;

		if (!studentId || !courseId) {
			throw new ApiError(400, 'Student ID and Course ID are required');
		}

		// ✅ Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId }
		});

		if (!student) {
			throw new ApiError(404, 'Student not found');
		}

		// ✅ Verify course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			throw new ApiError(404, 'Course not found');
		}

		// ✅ Verify enrollment exists
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				studentId_courseId: {
					studentId,
					courseId
				}
			}
		});

		if (!enrollment) {
			throw new ApiError(404, 'Student is not enrolled in this course');
		}

		// 🗑️ Delete enrollment (cascades to testAttempts & attemptAnswers for this course's tests)
		await prisma.enrollment.delete({
			where: {
				studentId_courseId: {
					studentId,
					courseId
				}
			}
		});

		// 🧾 Audit log
		logEvent('StudentUnenrolled', {
			adminId,
			studentId,
			courseId,
			courseTitle: course.title
		});

		return NextResponse.json(new ApiResponse(200, null, 'Student unenrolled successfully'), {
			status: 200
		});
	} catch (error) {
		return handleError('UnenrollStudent', error);
	}
}
