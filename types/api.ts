export interface SuccessResponseTypes<T> {
	statusCode: number;
	data?: T;
	message: string;
	success?: boolean;
}

export interface ErrorResponseTypes<T> {
	statusCode: number;
	message: string;
	success?: boolean;
	errors?: T;
}
