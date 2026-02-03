import { NextRequest, NextResponse } from 'next/server';
import ms from 'ms';
import { generateAccessToken, generateRefreshToken, verifyJwt } from '@/utils/tokens';

function isPublic(pathname: string) {
	return (
		pathname === '/admin-login' ||
		pathname === '/student-login' ||
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
		const loginPath = pathname.startsWith('/admin') ? '/admin-login' : '/student-login';
		return NextResponse.redirect(new URL(loginPath, request.url));
	}

	// Role-based route guard for UI
	if (pathname.startsWith('/admin') && user.role !== 'admin') {
		return NextResponse.redirect(new URL('/student/dashboard', request.url));
	}
	if (pathname.startsWith('/student') && user.role !== 'student') {
		return NextResponse.redirect(new URL('/admin/dashboard', request.url));
	}

	// For APIs you CAN add an early role check, but controllers already enforce it.
	// Return NextResponse.next(), attaching any rotated cookies if needed:
	return responseWithCookies ?? NextResponse.next();
}

type AuthUser = {
	id: string;
	role: 'admin' | 'student';
};

type EnsureUserResult = {
	user: AuthUser | null;
	responseWithCookies: NextResponse | null;
};

async function ensureUser(
	accessToken: string | undefined,
	refreshToken: string | undefined
): Promise<EnsureUserResult> {
	// 1) Try access token first
	if (accessToken) {
		try {
			const decoded = verifyJwt('access', accessToken) as AuthUser;
			return {
				user: { id: decoded.id, role: decoded.role },
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
			const user: AuthUser = { id: decoded.id, role: decoded.role };

			const newAccessToken = generateAccessToken(user.id, user.role);
			const newRefreshToken = generateRefreshToken(user.id, user.role);

			const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
			const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

			const accessTokenMaxAgeSeconds = Math.floor(ms(ACCESS_TOKEN_EXPIRY as ms.StringValue) / 1000);
			const refreshTokenMaxAgeSeconds = Math.floor(
				ms(REFRESH_TOKEN_EXPIRY as ms.StringValue) / 1000
			);

			// Use NextResponse.next() so the original request continues, but attach new cookies
			const response = NextResponse.next();

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
		'/student/:path*', // all student UI
		'/admin/:path*', // all admin UI
		'/api/admin/:path*',
		'/api/student/:path*'
	]
};
