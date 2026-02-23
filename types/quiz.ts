export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE_ANSWER';

export interface Option {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	type: QuestionType;
	question: string;
	options?: Option[];
	correctAnswer: string; // option id for MCQ/TRUE_FALSE, text for others
}

export interface QuizData {
	id: string;
	title: string;
	description: string;
	timeLimit: number; // seconds
	questions: Question[];
}

export interface QuizAnswer {
	questionId: string;
	answer: string;
}

export interface QuizResult {
	totalQuestions: number;
	answered: number;
	correct: number;
	wrong: number;
	skipped: number;
	timeTaken: number; // seconds
}
