import { ErrorResponseTypes } from '@/types/api';

class ApiError<T> extends Error implements ErrorResponseTypes<T> {
	public success: boolean = false;

	constructor(
		public statusCode: number,
		public message: string = 'Something went wrong',
		public errors?: T,
		stack: string = ''
	) {
		super(message);

		this.statusCode = statusCode;
		this.message = message;

		Object.setPrototypeOf(this, new.target.prototype);

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export { ApiError };
