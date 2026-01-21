import { NextRequest } from 'next/server';
import { ApiError } from './api-error';

/**
 * Extract and validate user data from request headers set by middleware
 * Returns user id and role
 */
export function extractUserFromHeaders(request: NextRequest) {
	const userId = request.headers.get('x-user-id');
	const userRole = request.headers.get('x-user-role') as 'admin' | 'student' | null;

	if (!userId || !userRole) {
		throw new ApiError(401, 'Unauthorized: User not authenticated');
	}

	return {
		userId,
		userRole
	};
}

/**
 * Verify user has required role
 */
export function verifyRole(
	actualRole: string | null,
	requiredRole: 'admin' | 'student' | 'any'
): boolean {
	if (requiredRole === 'any') return true;
	return actualRole === requiredRole;
}

/**
 * Guard for protected routes - throws error if user is not authenticated
 */
export function requireAuth(request: NextRequest) {
	const userId = request.headers.get('x-user-id');
	const userRole = request.headers.get('x-user-role');

	if (!userId || !userRole) {
		throw new ApiError(401, 'Authentication required');
	}

	return { userId, userRole };
}

/**
 * Guard for role-based access - throws error if user doesn't have required role
 */
export function requireRole(request: NextRequest, allowedRoles: ('admin' | 'student')[]) {
	const { userId, userRole } = requireAuth(request);

	if (!allowedRoles.includes(userRole as 'admin' | 'student')) {
		throw new ApiError(403, 'Insufficient permissions for this operation');
	}

	return { userId, userRole };
}
