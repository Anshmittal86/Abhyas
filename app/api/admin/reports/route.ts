import {
	getCoursePerformanceReport,
	getStudentPerformanceReport,
	getTestAnalytics
} from '@/controllers/analytics.controllers';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const type = url.searchParams.get('type');

	if (type === 'course-performance') {
		return getCoursePerformanceReport(request as any);
	} else if (type === 'student-performance') {
		return getStudentPerformanceReport(request as any);
	} else if (type === 'test-analytics') {
		return getTestAnalytics(request as any);
	} else {
		return new Response(
			JSON.stringify({
				status: 400,
				message:
					'Invalid report type. Use: course-performance, student-performance, or test-analytics'
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}
}
