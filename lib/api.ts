import { CoursesListTypes } from '@/types/courses';
import { StudentsListTypes } from '@/types/student';
import { ResponseTypes } from '@/types/api';

export const fetchStudents = async (): Promise<StudentsListTypes[] | undefined> => {
	try {
		const res = await fetch('/api/admin/student', {
			method: 'GET',
			credentials: 'include'
		});

		const result = (await res.json()) as ResponseTypes<StudentsListTypes[]>;

		if (!res.ok || !result?.success) {
			throw new Error(result?.message || 'Network response was not ok');
		}

		return result.data;
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Failed to fetch Students: ${error.message}`);
		} else {
			console.error(`Unknown Error At Fetch Student: ${error}`);
		}
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

		const result = (await response.json()) as ResponseTypes<CoursesListTypes[]>;

		if (!response.ok || !result?.success) {
			throw new Error(result?.message || 'Fetching Courses Failed');
		}

		return result.data;
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Failed to fetch Courses: ${error.message}`);
		} else {
			console.error(`Unknown Error At Fetch Courses: ${error}`);
		}
	}
};
