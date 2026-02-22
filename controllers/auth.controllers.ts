// External (Next.js)
import { NextResponse } from 'next/server';

// Third-party packages
import { z } from 'zod';
import ms from 'ms';
import { prisma } from '@/src/db/client';
import bcrypt from 'bcrypt';

// Internal utils
import { ApiError } from '@/utils/api-error';
import { ApiResponse } from '@/utils/api-response';
import { logEvent } from '@/utils/log-event.js';

import buildRefreshResponse from '@/utils/auth-response';

// Internal services
import {
	generateAccessAndRefreshTokens,
	validateRefreshToken,
	isPasswordCorrect
} from '@/services/adminService';
import { requireAuth } from '@/utils/auth-guard';
import { asyncHandler } from '@/utils/async-handler';

// Zod login schema
const AdminLogin = z.object({
	email: z.email('Please enter a valid email address').trim(),
	password: z.string().min(8, 'Password must be at least 8 characters long')
});

const StudentLogin = z.object({
	provisionalNo: z.string().min(3, 'Provisional number must be at least 3 characters long'),
	password: z.string().min(8, 'Password must be at least 8 characters long')
});

export const loginAdmin = asyncHandler('LoginAdmin', async (request) => {
	const body = await request.json();
	const { email, password } = AdminLogin.parse(body);

	const admin = await prisma.admin.findUnique({ where: { email } });
	if (!admin) {
		logEvent('LoginFailed', { email, reason: 'Invalid credentials' });
		throw new ApiError(401, 'Invalid credentials');
	}

	// 🔐 Verify password correctness using secure hashing
	const isPasswordValid = await isPasswordCorrect(password, admin.password);
	if (!isPasswordValid) {
		logEvent('LoginFailed', { email, reason: 'Invalid credentials' });
		throw new ApiError(401, 'Invalid credentials');
	}

	// 🪙 Generate short-lived access token and long-lived refresh token
	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens('admin', admin.id);

	// ⏱️ Token expiry durations (default fallback for safety)
	const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
	const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

	// Convert expiry time from string (e.g., '15m') to seconds
	const accessTokenMaxAgeSeconds = Math.floor(ms(ACCESS_TOKEN_EXPIRY as ms.StringValue) / 1000);
	const refreshTokenMaxAgeSeconds = Math.floor(ms(REFRESH_TOKEN_EXPIRY as ms.StringValue) / 1000);

	// Update last login
	await prisma.admin.update({
		where: { id: admin.id },
		data: { lastLogin: new Date() }
	});

	// ✅ Build JSON response
	const response: NextResponse = NextResponse.json(new ApiResponse(200, null, 'Login successful'), {
		status: 200
	});

	// 🍪 Set secure cookies for session management
	// HttpOnly → prevents JS access
	// Secure → only HTTPS
	// SameSite → protects against CSRF
	response.cookies.set('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		sameSite: 'strict',
		maxAge: accessTokenMaxAgeSeconds
	});

	response.cookies.set('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		sameSite: 'strict',
		maxAge: refreshTokenMaxAgeSeconds
	});

	// 🟢 Log successful login for audit trail
	logEvent('LoginSuccess', { adminId: admin.id, email });
	return response;
});

export const logoutUser = asyncHandler('LogoutUser', async (request) => {
	// Get refresh token from cookies
	const refreshToken = request.cookies.get('refreshToken')?.value;

	const { userId, userRole } = requireAuth(request);
	if (!userId || !userRole) {
		throw new ApiError(401, 'Authentication required');
	}

	// Ensure refresh token exists
	if (!refreshToken) {
		throw new ApiError(401, 'Refresh token not found');
	}

	// Validate & find refresh token record
	const tokenRecord = await validateRefreshToken(refreshToken);

	// Extra safety check: ensure token belongs to requesting user
	if (userRole === tokenRecord.role && userId === String(tokenRecord[`${userRole}Id`])) {
		await prisma.refreshToken.delete({
			where: {
				id: tokenRecord.id
			}
		});
	} else {
		throw new ApiError(403, 'Unauthorized logout request');
	}

	// ✅ Build JSON response
	const response: NextResponse = NextResponse.json(
		new ApiResponse(200, null, 'Logout successful'),
		{
			status: 200
		}
	);

	// Clear cookies
	response.cookies.set('accessToken', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		sameSite: 'strict',
		maxAge: 0
	});

	response.cookies.set('refreshToken', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		sameSite: 'strict',
		maxAge: 0
	});

	// Audit log
	logEvent('LogoutSuccess', {
		id: tokenRecord.id,
		role: tokenRecord.role
	});

	return response;
});

export const refreshToken = asyncHandler('refreshToken', async (request) => {
	// 🍪 Get refresh token from cookies
	const refreshToken = request.cookies.get('refreshToken')?.value;
	if (!refreshToken) {
		throw new ApiError(401, 'Refresh token not found');
	}

	// 🔍 Validate refresh token (hash compare + expiry + revoke)
	const tokenRecord = await validateRefreshToken(refreshToken);

	if (!tokenRecord) {
		throw new ApiError(401, 'Invalid or expired refresh token');
	}

	// 🔥 ROTATION: delete old refresh token
	await prisma.refreshToken.delete({
		where: { id: tokenRecord.id }
	});

	const { role, adminId, studentId } = tokenRecord;

	// 🔐 ROLE-BASED HANDLING
	if (role === 'admin') {
		if (!adminId) {
			throw new ApiError(403, 'Invalid admin refresh token');
		}

		// ♻️ Generate new tokens
		const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(
			'admin',
			adminId
		);

		return buildRefreshResponse(request, accessToken, newRefreshToken, 'AdminTokenRefreshed', {
			adminId
		});
	}

	// ---------------- STUDENT ----------------
	if (role === 'student') {
		if (!studentId) {
			throw new ApiError(403, 'Invalid student refresh token');
		}

		// ♻️ Generate new tokens
		const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(
			'student',
			studentId
		);

		return buildRefreshResponse(request, accessToken, newRefreshToken, 'StudentTokenRefreshed', {
			studentId
		});
	}

	throw new ApiError(403, 'Unsupported token role');
});

export const studentLogin = asyncHandler('StudentLogin', async (request) => {
	const body = await request.json();
	const { provisionalNo, password: generatedPassword } = StudentLogin.parse(body);

	// 🔍 Find student by provisional number
	const student = await prisma.student.findUnique({
		where: { provisionalNo }
	});

	if (!student) {
		throw new ApiError(404, 'Student not found');
	}

	// 🔐 Validate password
	const isPasswordValid = await bcrypt.compare(generatedPassword, student.password);
	if (!isPasswordValid) {
		throw new ApiError(401, 'Invalid credentials');
	}

	// 🪙 Generate tokens
	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens('student', student.id);

	// ⏱️ Token expiry durations (default fallback for safety)
	const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
	const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
	const accessTokenMaxAgeSeconds = Math.floor(ms(ACCESS_TOKEN_EXPIRY as ms.StringValue) / 1000);
	const refreshTokenMaxAgeSeconds = Math.floor(ms(REFRESH_TOKEN_EXPIRY as ms.StringValue) / 1000);

	// ✅ Build JSON response
	const response: NextResponse = NextResponse.json(
		new ApiResponse(200, null, 'Student login successful'),
		{
			status: 200
		}
	);

	// 🍪 Set secure cookies
	response.cookies.set('accessToken', accessToken, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		maxAge: accessTokenMaxAgeSeconds
	});

	response.cookies.set('refreshToken', refreshToken, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		maxAge: refreshTokenMaxAgeSeconds
	});

	logEvent('StudentLoginSuccess', { studentId: student.id });
	return response;
});
