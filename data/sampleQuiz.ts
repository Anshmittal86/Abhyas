import { QuizData } from '@/types/quiz';

export const sampleQuiz: QuizData = {
	id: 'quiz-1',
	title: 'General Knowledge Quiz',
	description: 'Test your knowledge with MCQ and True/False questions.',
	timeLimit: 120, // 2 minutes
	questions: [
		{
			id: 'q1',
			type: 'MCQ',
			question: 'Which planet is known as the Red Planet?',
			options: [
				{ id: 'a', text: 'Venus' },
				{ id: 'b', text: 'Mars' },
				{ id: 'c', text: 'Jupiter' },
				{ id: 'd', text: 'Saturn' }
			],
			correctAnswer: 'b'
		},
		{
			id: 'q2',
			type: 'TRUE_FALSE',
			question: 'The Great Wall of China is visible from space with the naked eye.',
			options: [
				{ id: 'true', text: 'True' },
				{ id: 'false', text: 'False' }
			],
			correctAnswer: 'false'
		},
		{
			id: 'q3',
			type: 'MCQ',
			question: 'What is the chemical symbol for gold?',
			options: [
				{ id: 'a', text: 'Go' },
				{ id: 'b', text: 'Gd' },
				{ id: 'c', text: 'Au' },
				{ id: 'd', text: 'Ag' }
			],
			correctAnswer: 'c'
		},
		{
			id: 'q4',
			type: 'TRUE_FALSE',
			question: 'JavaScript was originally called LiveScript.',
			options: [
				{ id: 'true', text: 'True' },
				{ id: 'false', text: 'False' }
			],
			correctAnswer: 'true'
		},
		{
			id: 'q5',
			type: 'MCQ',
			question: 'Which data structure uses FIFO (First In, First Out)?',
			options: [
				{ id: 'a', text: 'Stack' },
				{ id: 'b', text: 'Queue' },
				{ id: 'c', text: 'Tree' },
				{ id: 'd', text: 'Graph' }
			],
			correctAnswer: 'b'
		},
		{
			id: 'q6',
			type: 'TRUE_FALSE',
			question: "HTTP status code 404 means 'Internal Server Error'.",
			options: [
				{ id: 'true', text: 'True' },
				{ id: 'false', text: 'False' }
			],
			correctAnswer: 'false'
		},
		{
			id: 'q7',
			type: 'MCQ',
			question: 'What does CSS stand for?',
			options: [
				{ id: 'a', text: 'Computer Style Sheets' },
				{ id: 'b', text: 'Cascading Style Sheets' },
				{ id: 'c', text: 'Creative Style System' },
				{ id: 'd', text: 'Colorful Style Sheets' }
			],
			correctAnswer: 'b'
		},
		{
			id: 'q8',
			type: 'TRUE_FALSE',
			question: 'Python is a compiled language.',
			options: [
				{ id: 'true', text: 'True' },
				{ id: 'false', text: 'False' }
			],
			correctAnswer: 'false'
		}
	]
};
