import { ResponseTypes } from '@/types/api';

class ApiResponse<T> implements ResponseTypes<T> {
	public success: boolean;

	constructor(
		public statusCode: number,
		public data: T,
		public message: string = 'Success'
	) {
		this.statusCode = statusCode;
		this.data = data;
		this.message = message;
		this.success = statusCode < 400;
	}
}

export { ApiResponse };
