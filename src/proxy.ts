// proxy.ts - Authentication and Route Protection Configuration
import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * PROTECTED ROUTES - Authentication required
 * These routes require a valid JWT token
 */
const protectedRoutes = [
	'/api/student/dashboard',
	'/api/student/attempts',
	'/api/student/tests',
	'/api/admin/courses',
	'/api/admin/chapter',
	'/api/admin/questions',
	'/api/admin/tests'
];

/**
 * Checks if a route is protected
 * @param pathname - The request path
 * @returns true if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const accessToken = request.cookies.get('accessToken')?.value; // ✅ Match cookie name from login

	// If route is protected and no token provided, redirect to login
	if (isProtectedRoute(pathname) && !accessToken) {
		const loginUrl = pathname.startsWith('/api/admin') ? '/admin-login' : '/student-login';
		return NextResponse.redirect(new URL(loginUrl, request.url));
	}

	// If token exists, decode and set headers
	if (accessToken) {
		let payloadInfo: JwtPayload;
		try {
			payloadInfo = jwt.decode(accessToken) as JwtPayload;

			// ✅ Set headers as STRING values (not JSON stringified)
			// Controller expects: request.headers.get('x-user-id') to return a string
			if (payloadInfo.id) {
				request.headers.set('x-user-id', String(payloadInfo.id));
			}
			if (payloadInfo.role) {
				request.headers.set('x-user-role', String(payloadInfo.role));
			}
			request.headers.set('Authorization', `Bearer ${accessToken}`);

			console.log('✅ Auth Headers Set:', {
				'x-user-id': String(payloadInfo.id),
				'x-user-role': String(payloadInfo.role)
			});
		} catch (error) {
			console.error('❌ Error decoding JWT:', error);
			// Continue without headers if decode fails
		}
	}

	// Allow all requests (public ones pass through, protected ones checked above)
	return NextResponse.next({
		request: {
			headers: request.headers
		}
	});
}

export const config = {
	matcher: ['/api/:path*']
};
