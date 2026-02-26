export default interface DashboardData {
	student: {
		id: string;
		name: string;
		email: string;
		provisionalNo: string;
	};
	stats: {
		enrolledCourses: number;
		totalTests: number;
		completedTests: number;
		pendingTests: number;
		averageScore: number;
	};
	nextAction: {
		type: 'RESUME_TEST' | 'START_TEST';
		testId: string;
		title: string;
		durationMinutes: number;
		questionCount: number;
		maxQuestions: number;
		attemptId?: string;
		courseTitle: string;
		chapterTitle: string;
	} | null;
	recentActivity: {
		attemptId: string;
		testId: string;
		title: string;
		durationMinutes: number;
		maxQuestions: number;
		questionCount: number;
		courseTitle: string;
		chapterTitle: string;
		chapterCode: string;
		score: number | null;
		gainedMarks: number;
		submittedAt: string | null;
		status: 'COMPLETED';
	} | null;
}
