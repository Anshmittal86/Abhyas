import { CoursesListTypes } from '@/types/courses';
import { StudentsListTypes } from '@/types/student';
import { SuccessResponseTypes } from '@/types/api';
import { ChaptersListTypes } from '@/types/chapters';

export const fetchStudents = async (): Promise<StudentsListTypes[] | undefined> => {
	try {
		const res = await fetch('/api/admin/student', {
			method: 'GET',
			credentials: 'include'
		});

		const result = (await res.json()) as SuccessResponseTypes<StudentsListTypes[]>;

		if (!result.success) {
			throw new Error(result.message || 'Failed to fetch students');
		}

		return result.data || [];
	} catch (error) {
		console.error('fetchStudents error:', error);
		throw error;
	}
};

export const fetchCourses = async (): Promise<CoursesListTypes[] | undefined> => {
	try {
		const response = await fetch('/api/admin/course', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		const result = (await response.json()) as SuccessResponseTypes<CoursesListTypes[]>;

		if (!result.success) {
			throw new Error(result.message || 'Failed to fetch courses');
		}

		return result.data || [];
	} catch (error) {
		console.error('fetchCourses error:', error);
		throw error;
	}
};

export async function fetchChapters(): Promise<ChaptersListTypes[] | undefined> {
	try {
		const res = await fetch('/api/admin/chapter', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const result = (await res.json()) as SuccessResponseTypes<ChaptersListTypes[]>;

		if (!result.success) {
			throw new Error(result.message || 'Failed to fetch chapters');
		}

		return result.data || [];
	} catch (error) {
		console.error('fetchChapters error:', error);
	}
}
