import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/utils/auth-guard';
import { ApiError } from '@/utils/api-error';
import { verifyJwt } from '@/utils/tokens';

export async function GET(request: NextRequest) {
	try {
		const { userId, userRole } = requireAuth(request);

		// attempt to read provisionalNo from access token if present
		// requireAuth only returns id and role; read token to extract provisionalNo
		const accessToken = request.cookies.get('accessToken')?.value;
		let provisionalNo: string | undefined;
		if (accessToken) {
			try {
				const decoded = verifyJwt('access', accessToken) as any;
				provisionalNo = decoded?.provisionalNo;
			} catch {
				// ignore
			}
		}

		return NextResponse.json({ id: userId, role: userRole, provisionalNo });
	} catch (err) {
		if (err instanceof ApiError) {
			return NextResponse.json({ error: err.message }, { status: err.statusCode });
		}
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
}
