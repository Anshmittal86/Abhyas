// Attempt initialization and completion types
export type FinalizeAttemptResult = {
	attemptId: string;
	testId: string;
	score: number; // percentage
	totalMarks: number;
	gainedMarks: number;
	maxQuestions: number;
	correctAnswers: number;
	accuracy: number;
};

// Student results page
export type StudentResultPayload = {
	test: {
		id: string;
		title: string;
		totalMarks: number;
		maxQuestions: number;
		durationMinutes: number;
		chapter: { title: string };
		course: { title: string };
	};
	statistics?: {
		totalAttempts: number;
		totalGainedMarks: number;
		totalPossibleMarks: number;
		averageMarks: number;
		bestMarks: number;
		latestScore: number | null; // percentage
		latestAccuracy: number;
		timeTakenMinutes: number | null;
	};
	attempts: Array<{
		id: string;
		submittedAt: string;
		score: number | null; // percentage
		totalMarks: number;
		gainedMarks: number;
		answeredQuestions: number;
		correctAnswers: number;
		accuracy: number;
	}>;
};

// Question with options for active test
export type AttemptQuestionPayload = {
	id: string;
	text: string;
	questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
	options: Array<{
		id: string;
		text: string;
		orderIndex: number;
		isCorrect: boolean;
	}>;
};

// Active test page
export type ActiveTestPayload = {
	attemptId: string;
	testId: string;
	currentIndex: number;
	answeredCount: number;
	maxQuestions: number;
	remainingSeconds: number;
	question: AttemptQuestionPayload;
	selectedOptionId: string | null;
};

// Answer payload
export type AnswerPayload = {
	attemptId: string;
	questionId: string;
	selectedOptionId: string | null;
};

// Submit response
export type SubmitTestPayload = {
	submitted: boolean;
	score: number; // percentage
	totalMarks: number;
	gainedMarks: number;
	maxQuestions: number;
	correctAnswers: number;
	accuracy: number;
};

// New comprehensive results types for all tests view
export type AttemptResult = {
	id: string;
	submittedAt: string;
	score: number | null; // percentage
	totalMarks: number;
	gainedMarks: number;
	answeredQuestions: number;
	correctAnswers: number;
	accuracy: number;
};

export type TestResultItem = {
	id: string;
	testId: string;
	testTitle: string;
	courseName: string;
	chapterName: string;
	score: number | null; // percentage
	totalMarks: number;
	maxQuestions: number;
	gainedMarks: number;
	answeredQuestions: number;
	accuracy: number;
	submittedAt: string;
};

export type AllTestResultsData = {
	summary: {
		totalResults: number;
		totalGainedMarks: number;
		totalPossibleMarks: number;
		averageMarks: number;
		overallPercentage: number;
	};
	allResults: TestResultItem[];
	courseResults: Array<{
		courseId: string;
		courseTitle: string;
		totalTests: number;
		totalGainedMarks: number;
		totalPossibleMarks: number;
		averageMarks: number;
		percentage: number;
		attempts: TestResultItem[];
	}>;
};
