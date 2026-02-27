// List Questions Types

export type QuestionListTypes = {
	id: string;
	questionText: string;
	questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
	explanation: string | null;
	marks: number;
	difficulty: 'EASY' | 'MEDIUM' | 'HARD';
	options: QuestionOptionListTypes[];
	test: {
		id: string;
		title: string;
	};
	answerCount: number;
	createdAt: string;
	updatedAt: string;
};

type QuestionOptionListTypes = {
	id: string;
	optionText: string;
	isCorrect: boolean;
	orderIndex: number;
};

// Get Question Types
export type QuestionDetailsTypes = {
	id: string;
	questionText: string;
	questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
	explanation: string | null;
	difficulty: 'EASY' | 'MEDIUM' | 'HARD';
	marks: number;
	options: QuestionDetailsOptionTypes[];
	test: QuestionDetailsTestTypes;
	answers: QuestionAnswerDetailsTypes[];
	createdAt: string;
	updatedAt: string;
};

type QuestionDetailsOptionTypes = {
	id: string;
	optionText: string;
	isCorrect: boolean;
	orderIndex: number;
};

type QuestionAnswerStudentTypes = {
	id: string;
	name: string;
	provisionalNo: string;
};

type QuestionAnswerSelectedOptionTypes = {
	id: string;
	optionText: string;
	isCorrect: boolean;
} | null;

type QuestionAnswerDetailsTypes = {
	id: string;
	selectedOption: QuestionAnswerSelectedOptionTypes;
	textAnswer: string | null;
	codeAnswer: string | null;
	isCorrect: boolean | null;
	marksAwarded: number | null;
	answeredAt: string;
	student: QuestionAnswerStudentTypes;
};

type QuestionDetailsChapterTypes = {
	id: string;
	title: string;
	code: string;
};

type QuestionDetailsTestTypes = {
	id: string;
	title: string;
	chapter: QuestionDetailsChapterTypes;
};

// Create Question Form Types

type BaseCreateQuestionFormTypes = {
	testId: string;
	questionText: string;
	questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'CODE';
	explanation?: string;
	marks?: number;
};

type QuestionOptionFormTypes = {
	optionText: string;
	isCorrect: boolean;
	orderIndex: number;
};

type CreateMCQQuestionFormTypes = BaseCreateQuestionFormTypes & {
	questionType: 'MCQ';
	options: QuestionOptionFormTypes[];
};

type CreateTrueFalseQuestionFormTypes = BaseCreateQuestionFormTypes & {
	questionType: 'TRUE_FALSE';
	options: QuestionOptionFormTypes[];
};

type CreateShortAnswerQuestionFormTypes = BaseCreateQuestionFormTypes & {
	questionType: 'SHORT_ANSWER';
};

type CreateLongAnswerQuestionFormTypes = BaseCreateQuestionFormTypes & {
	questionType: 'LONG_ANSWER';
};

type CreateCodeQuestionFormTypes = BaseCreateQuestionFormTypes & {
	questionType: 'CODE';
	starterCode?: string;
	language?: string;
};

export interface BulkUploadTestDataTypes {
	id: string;
	title: string;
	maxQuestions: number;
	currentQuestionCount: number;
}

export type CreateQuestionFormTypes =
	| CreateMCQQuestionFormTypes
	| CreateTrueFalseQuestionFormTypes
	| CreateShortAnswerQuestionFormTypes
	| CreateLongAnswerQuestionFormTypes
	| CreateCodeQuestionFormTypes;
