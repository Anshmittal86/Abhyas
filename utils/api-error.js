class ApiError extends Error {
	constructor(statusCode, message, errors = [], stack = '') {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.success = false;
		this.errors = errors;

		Object.setPrototypeOf(this, new.target.prototype);

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export { ApiError };
