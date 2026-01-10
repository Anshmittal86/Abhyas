import { NextResponse } from 'next/server';
import { prisma } from '@/src/db/client';
import { ApiError } from '@/utils/api-error.js';
import { ApiResponse } from '@/utils/api-response.js';

export async function GET() {
	try {
		await prisma.$queryRaw`SELECT 1`;

		return NextResponse.json(new ApiResponse(200, { message: 'Database connection successful' }));
	} catch (error) {
		console.error('❌ Healthcheck Error:', error);
		return NextResponse.json(new ApiError(503, 'Database connection failed', [error]));
	}
}
