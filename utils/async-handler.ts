import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/utils/handle-error';

/**
 * AsyncHandler Wrapper
 * Wraps async controller functions with standardized try-catch and error handling
 * Eliminates repetitive try-catch blocks across all controllers
 *
 * Usage:
 * export const createTest = asyncHandler('CreateTest', async (request) => {
 *   // business logic
 *   return NextResponse.json(new ApiResponse(...), { status: 200 });
 * });
 */
export function asyncHandler(
	actionName: string,
	handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
	return async (request: NextRequest, ...args: any[]) => {
		try {
			return await handler(request, ...args);
		} catch (error) {
			return handleApiError(actionName, error);
		}
	};
}

/**
 * AsyncHandlerWithContext Wrapper
 * For handlers that need access to params via context
 *
 * Usage:
 * export const updateTest = asyncHandlerWithContext(
 *   'UpdateTest',
 *   async (request, context) => {
 *     const { testId } = await context.params;
 *     // business logic
 *     return NextResponse.json(new ApiResponse(...), { status: 200 });
 *   }
 * );
 */
export function asyncHandlerWithContext(
	actionName: string,
	handler: (
		request: NextRequest,
		context: { params: Promise<Record<string, string>> }
	) => Promise<NextResponse>
) {
	return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
		try {
			return await handler(request, context);
		} catch (error) {
			return handleApiError(actionName, error);
		}
	};
}
