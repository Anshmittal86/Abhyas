import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiError } from './api-error';

type UserRole = 'admin' | 'student';

interface JwtPayload {
	id: string;
	role: UserRole;
}

export function generateAccessToken(id: string, role: UserRole): string {
	const secret = process.env.ACCESS_TOKEN_SECRET || 'this_is_default_secret_access';
	const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || '1d';

	const payload: JwtPayload = { id, role };
	return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function generateRefreshToken(id: string, role: UserRole): string {
	const secret = process.env.REFRESH_TOKEN_SECRET || 'this_is_default_secret_refresh';
	const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '7d';

	const payload: JwtPayload = { id, role };
	return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function verifyJwt(type: 'access' | 'refresh', token: string) {
	let secret;
	if (type === 'access') {
		secret = process.env.ACCESS_TOKEN_SECRET || 'this_is_default_secret_access';
	} else {
		secret = process.env.REFRESH_TOKEN_SECRET || 'this_is_default_secret_refresh';
	}

	try {
		return jwt.verify(token, secret);
	} catch {
		throw new ApiError(400, 'Invalid or expired access token');
	}
}
