// External (Next.js)
import { NextRequest, NextResponse } from 'next/server';

// Third-party packages
import { z } from 'zod';
import ms from 'ms';
import { prisma } from '@/src/db/client';

// Internal utils
import { ApiError } from '@/utils/api-error.js';
import { ApiResponse } from '@/utils/api-response.js';
import { logEvent } from '@/utils/log-event.js';
import { handleApiError as handleError } from '@/utils/handle-error';

// Internal services
import {
	generateAccessAndRefreshTokens,
	validateRefreshToken,
	isPasswordCorrect
} from '@/services/adminService';

// Zod login schema
const loginSchema = z.object({
	email: z.email('Please enter a valid email address').trim(),
	password: z.string().min(8, 'Password must be at least 8 characters long')
});

export async function loginAdmin(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = loginSchema.parse(body);

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

		// Optional but recommended: revoke old refresh tokens
		await prisma.refreshToken.updateMany({
			where: { adminId: admin.id, isRevoked: false },
			data: { isRevoked: true }
		});

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
		const response = NextResponse.json(new ApiResponse(200, null, 'Login successful'), {
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
	} catch (error) {
		return handleError('LoginAdmin', error);
	}
}
