import { NextResponse } from 'next/server';

// Authenticated user information
export type AuthUser = {
	id: string;
	role: 'admin' | 'student';
	provisionalNo?: string;
};

// Ensure user result
export type EnsureUserResult = {
	user: AuthUser | null;
	responseWithCookies: NextResponse | null;
};

// Login credentials
export type LoginCredentials = {
	email: string;
	password: string;
};

// Auth token payload
export type TokenPayload = {
	userId: string;
	role: 'admin' | 'student';
	iat?: number;
	exp?: number;
};

// Login response
export type LoginResponse = {
	statusCode: number;
	success: boolean;
	message: string;
	data?: {
		accessToken: string;
		refreshToken: string;
		user: {
			id: string;
			email: string;
			role: 'admin' | 'student';
		};
	};
};
