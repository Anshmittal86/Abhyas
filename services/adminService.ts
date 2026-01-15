// Third-party packages
import bcrypt from 'bcrypt';
import ms from 'ms';
import { prisma } from '@/src/db/client';

// Internal utils
import { generateAccessToken, generateRefreshToken } from '../utils/tokens';
import { ApiError } from '@/utils/api-error.js';

export const generateAccessAndRefreshTokens = async (type: 'admin' | 'student', id: string) => {
	const SALT_ROUND = Number(process.env.SALT_ROUND || 10);
	const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

	const expiryMs = ms(REFRESH_TOKEN_EXPIRY as ms.StringValue); // '7d' → ms
	const expiresAt = new Date(Date.now() + expiryMs);

	// Validate user exists
	if (type === 'admin') {
		const admin = await prisma.admin.findUnique({ where: { id } });
		if (!admin) throw new ApiError(404, 'Admin not found');
	} else {
		const student = await prisma.student.findUnique({ where: { id } });
		if (!student) throw new ApiError(404, 'Student not found');
	}

	// Generate tokens
	const accessToken = generateAccessToken(id, type);
	const refreshToken = generateRefreshToken(id, type);

	// Hash refresh token (DB only)
	const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUND);

	// Persist in DB (transaction-safe)
	await prisma.$transaction([
		prisma.refreshToken.create({
			data: {
				role: type,
				tokenHash,
				expiresAt,
				adminId: type === 'admin' ? id : null,
				studentId: type === 'student' ? id : null
			}
		})
	]);

	// Return access and refresh token
	return {
		accessToken,
		refreshToken
	};
};

export const validateRefreshToken = async (rawRefreshToken: string) => {
	const tokenRecords = await prisma.refreshToken.findMany({
		where: {
			isRevoked: false,
			expiresAt: { gt: new Date() }
		}
	});

	for (const record of tokenRecords) {
		const isMatch = await bcrypt.compare(rawRefreshToken, record.tokenHash);
		if (isMatch) {
			return record;
		}
	}

	throw new ApiError(401, 'Invalid refresh token');
};

export const isPasswordCorrect = async (plainPassword: string, hashedPassword: string) => {
	try {
		return await bcrypt.compare(plainPassword, hashedPassword);
	} catch {
		throw new ApiError(401, 'Invalid Password');
	}
};
