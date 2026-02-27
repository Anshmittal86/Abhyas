import { BulkUploadTestDataTypes } from './questions';

type AttemptStatus = 'COMPLETED' | 'IN_PROGRESS';

interface AdminDashboardStats {
	totalStudents: number;
	totalTests: number;
	totalQuestions: number;
	todayAttempts: number;
}

interface AdminRecentActivity {
	studentName: string;
	testTitle: string;
	score: number;
	status: AttemptStatus;
	submittedAt: string;
}

export interface AdminDashboardData {
	stats: AdminDashboardStats;
	recentActivities: AdminRecentActivity[];
	testsWithQuestionCount: BulkUploadTestDataTypes[];
}
