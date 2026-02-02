import { NextRequest, NextResponse } from 'next/server';
import ms from 'ms';

import { ApiResponse } from './api-response';
import { logEvent } from './log-event';

function buildRefreshResponse(
	request: NextRequest,
	accessToken: string,
	refreshToken: string,
	logEventName: string,
	logMeta: Record<string, unknown>
) {
	const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
	const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

	const accessTokenMaxAgeSeconds = Math.floor(ms(ACCESS_TOKEN_EXPIRY as ms.StringValue) / 1000);

	const refreshTokenMaxAgeSeconds = Math.floor(ms(REFRESH_TOKEN_EXPIRY as ms.StringValue) / 1000);

	const response = NextResponse.json(new ApiResponse(200, null, 'Token refreshed'), {
		status: 200
	});

	response.cookies.set('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: accessTokenMaxAgeSeconds
	});

	response.cookies.set('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: refreshTokenMaxAgeSeconds
	});

	logEvent(logEventName, logMeta);

	return response;
}

export default buildRefreshResponse;
