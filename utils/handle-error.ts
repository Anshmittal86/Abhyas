// External Imports
import { NextResponse } from 'next/server';

// Third-party packages
import { ZodError } from 'zod';

// Internal utils
import { ApiError } from '@/utils/api-error';
import { logEvent } from '@/utils/log-event';

/**
 * Handles and formats all API errors consistently.
 * - Validates Zod errors and returns 400 with validation messages
 * - Handles ApiError instances with custom status codes and messages
 * - Catches unexpected errors and returns 500 with details
 * Used across all controllers (Course, Certificate, etc.)
 */
export function handleApiError(context: string, error: unknown) {
	// Handle Zod validation errors
	if (error instanceof ZodError) {
		// Extract path and message from each issue
		const errors = error.issues.map((issue) => {
			return [issue.path.join('.'), issue.message];
		});

		// Format errors for response
		const formattedErrors = Object.fromEntries(errors);

		// Log validation failure event
		logEvent(`ValidationFailed`, { formattedErrors, context });
		return NextResponse.json(
			{
				statusCode: 400,
				success: false,
				message: 'Validation failed',
				formattedErrors
			},
			{ status: 400 }
		);
	}

	// Handle custom ApiError with message and status
	if (error instanceof ApiError) {
		logEvent(`${context}Error`, {
			statusCode: error.statusCode,
			message: error.message,
			errors: error.errors
		});
		return NextResponse.json(
			{
				statusCode: error.statusCode,
				success: false,
				message: error.message,
				errors: error.errors || []
			},
			{ status: error.statusCode }
		);
	}

	// Handle unexpected errors
	const errorMessage = error instanceof Error ? error.message : String(error);
	logEvent(`Unexpected${context}Error`, { error: errorMessage });
	return NextResponse.json(
		{
			statusCode: 500,
			success: false,
			message: 'Internal server error',
			errors: process.env.NODE_ENV === 'development' ? [errorMessage] : []
		},
		{ status: 500 }
	);
}
