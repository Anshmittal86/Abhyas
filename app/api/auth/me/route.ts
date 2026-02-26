import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAuth } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';

export async function GET(request: NextRequest) {
	try {
		const { userId, userRole } = requireAuth(request);

		let userData: any = { id: userId, role: userRole };

		if (userRole === 'student') {
			const student = await prisma.student.findUnique({
				where: { id: userId },
				select: {
					name: true,
					email: true,
					provisionalNo: true
				}
			});

			if (student) {
				userData = {
					...userData,
					name: student.name,
					email: student.email,
					provisionalNo: student.provisionalNo
				};
			}
		} else if (userRole === 'admin') {
			const admin = await prisma.admin.findUnique({
				where: { id: userId },
				select: {
					name: true,
					email: true
				}
			});

			if (admin) {
				userData = {
					...userData,
					name: admin.name,
					email: admin.email,
					provisionalNo: null // admin ke liye nahi hota
				};
			}
		}

		return NextResponse.json(userData);
	} catch (err) {
		console.error('Auth/me error:', err);
		if (err instanceof ApiError) {
			return NextResponse.json({ error: err.message }, { status: err.statusCode });
		}
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
}
