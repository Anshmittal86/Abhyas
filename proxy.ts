import { NextRequest, NextResponse } from 'next/server';
import ms from 'ms';
import { generateAccessToken, generateRefreshToken, verifyJwt } from '@/utils/tokens';
import { AuthUser, EnsureUserResult } from '@/types';

function isPublic(pathname: string) {
	return (
		pathname === '/admin/login' ||
		pathname === '/login' ||
		pathname.startsWith('/api/auth') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/assets')
	);
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const accessToken = request.cookies.get('accessToken')?.value;
	const refreshToken = request.cookies.get('refreshToken')?.value;

	// Public routes: allow without checks
	if (isPublic(pathname)) {
		return NextResponse.next();
	}

	// Try to verify/refresh tokens
	const { user, responseWithCookies } = await ensureUser(accessToken, refreshToken);

	if (!user) {
		// redirect to correct login
		const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
		return NextResponse.redirect(new URL(loginPath, request.url));
	}

	// Role-based route guard for UI
	if (pathname.startsWith('/admin')) {
		if (user.role !== 'admin') {
			// If a student is logged in, send them to their dashboard
			if (user.role === 'student') return NextResponse.redirect(new URL('/dashboard', request.url));
			// Fallback: send to admin login
			return NextResponse.redirect(new URL('/admin/login', request.url));
		}
	}

	// Student UI prefixes
	const isStudentUi =
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/courses') ||
		pathname.startsWith('/tests') ||
		pathname.startsWith('/test') ||
		pathname.startsWith('/leaderboard');

	if (isStudentUi) {
		if (user.role !== 'student') {
			// If an admin is logged in, send to admin dashboard
			if (user.role === 'admin')
				return NextResponse.redirect(new URL('/admin/dashboard', request.url));
			// Fallback: send to student login
			return NextResponse.redirect(new URL('/login', request.url));
		}
	}

	// Student provisionalNo enforcement: redirect to login if missing
	if (pathname.startsWith('/student/dashboard') && user.role === 'student' && !user.provisionalNo) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// For APIs you CAN add an early role check, but controllers already enforce it.
	// Return NextResponse.next(), attaching any rotated cookies if needed and user headers:
	const response = responseWithCookies ?? NextResponse.next();

	// attach headers for downstream code (controllers / pages can read these)
	if (!response.headers.get('x-user-id')) {
		response.headers.set('x-user-id', user.id);
		response.headers.set('x-user-role', user.role);
		if (user.provisionalNo) response.headers.set('x-provisional-no', user.provisionalNo);
	}

	return response;
}

async function ensureUser(
	accessToken: string | undefined,
	refreshToken: string | undefined
): Promise<EnsureUserResult> {
	// 1) Try access token first
	if (accessToken) {
		try {
			const decoded = verifyJwt('access', accessToken) as AuthUser;
			return {
				user: { id: decoded.id, role: decoded.role, provisionalNo: decoded.provisionalNo },
				responseWithCookies: null
			};
		} catch {
			// fall through and try refresh token
		}
	}

	// 2) Fallback to refresh token
	if (refreshToken) {
		try {
			const decoded = verifyJwt('refresh', refreshToken) as AuthUser;
			const user: AuthUser = {
				id: decoded.id,
				role: decoded.role,
				provisionalNo: decoded.provisionalNo
			};

			const newAccessToken = generateAccessToken(user.id, user.role, user.provisionalNo);
			const newRefreshToken = generateRefreshToken(user.id, user.role, user.provisionalNo);

			const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
			const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

			const accessTokenMaxAgeSeconds = Math.floor(ms(ACCESS_TOKEN_EXPIRY as ms.StringValue) / 1000);
			const refreshTokenMaxAgeSeconds = Math.floor(
				ms(REFRESH_TOKEN_EXPIRY as ms.StringValue) / 1000
			);

			// Use NextResponse.next() so the original request continues, but attach new cookies
			const response = NextResponse.next();

			// attach rotated cookies
			response.cookies.set('accessToken', newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: accessTokenMaxAgeSeconds
			});

			response.cookies.set('refreshToken', newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: refreshTokenMaxAgeSeconds
			});
			// attach user headers for downstream APIs/pages
			response.headers.set('x-user-id', user.id);
			response.headers.set('x-user-role', user.role);
			if (user.provisionalNo) response.headers.set('x-provisional-no', user.provisionalNo);

			return {
				user,
				responseWithCookies: response
			};
		} catch {
			// refresh token invalid/expired → treat as unauthenticated
			return { user: null, responseWithCookies: null };
		}
	}

	// 3) No valid tokens
	return { user: null, responseWithCookies: null };
}

export const config = {
	matcher: [
		// Admin UI
		'/admin/:path*',
		// Student UI (real route prefixes)
		'/dashboard/:path*',
		'/courses/:path*',
		'/tests/:path*',
		'/test/:path*',
		'/leaderboard/:path*',
		// Protect relevant APIs
		'/api/admin/:path*',
		'/api/student/:path*'
	]
};
