'use client';

import { useState, useEffect } from 'react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { CreateQuestionFormTypes, TestsListTypes } from '@/types';
import { fetchTests } from '@/lib/api';
import { toast } from 'sonner';
import MCQOptionsField from './question/MCQOptionsField';
import TrueFalseOptionsField from './question/TrueFalseOptionsField';
import CodeQuestionField from '@/components/forms/question/CodeQuestionField';
import { SquarePen } from 'lucide-react';

type Props = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
	trigger?: React.ReactNode;
};

export default function CreateQuestionFormSheet({ open, onOpenChange, onSuccess, trigger }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [tests, setTests] = useState<TestsListTypes[]>([]);

	const form = useForm<CreateQuestionFormTypes>({
		defaultValues: {
			testId: '',
			questionText: '',
			questionType: 'MCQ',
			explanation: '',
			marks: 1,
			options: [
				{ optionText: '', isCorrect: false, orderIndex: 0 },
				{ optionText: '', isCorrect: false, orderIndex: 1 },
				{ optionText: '', isCorrect: false, orderIndex: 2 },
				{ optionText: '', isCorrect: false, orderIndex: 3 }
			]
		}
	});

	// Continuously watch the questionType field to conditionally render form fields based on the selected question type
	const questionType = form.watch('questionType');

	const handleOpenChange = (value: boolean) => {
		setIsOpen(value);
		onOpenChange?.(value);
	};

	useEffect(() => {
		if (!open && !isOpen) {
			return;
		}

		const loadTests = async () => {
			try {
				const tests = await fetchTests();
				setTests(tests || []);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`${error.message || 'Failed to load tests'}`);
					console.error('Error loading tests:', error);
				} else {
					toast.error('An unknown error occurred while loading tests');
					console.error('Unknown error loading tests:', error);
				}
				setTests([]);
			}
		};

		loadTests();
	}, [open, isOpen]);

	const handleSubmit = async (data: CreateQuestionFormTypes) => {
		try {
			const res = await fetch('/api/admin/question', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.message);
			}

			toast.success('Question created successfully');

			form.reset();

			onSuccess?.();

			setIsOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create question');
		}
	};

	return (
		<>
			{trigger && <div onClick={() => setIsOpen(true)}>{trigger}</div>}

			<Sheet open={trigger ? isOpen : open} onOpenChange={handleOpenChange}>
				<SheetContent className="sm:max-w-2xl h-screen flex flex-col bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle>Create Question</SheetTitle>
						<SheetDescription>Create a new question for a test</SheetDescription>
					</SheetHeader>

					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="flex flex-col flex-1 overflow-y-auto"
					>
						<div className="flex-1  py-6 space-y-5 pr-2 scroll-smooth scrollbar-thin">
							<FormField
								control={form.control}
								name="testId"
								label="Test"
								type="select"
								placeholder="Select Test"
								options={tests.map((test) => ({ value: test.id, label: test.title }))}
								required
							/>

							<FormField
								control={form.control}
								name="questionType"
								label="Question Type"
								type="select"
								placeholder="Select Question Type"
								required
								options={[
									{ value: 'MCQ', label: 'MCQ' },
									{ value: 'TRUE_FALSE', label: 'True / False' },
									{ value: 'SHORT_ANSWER', label: 'Short Answer' },
									{ value: 'LONG_ANSWER', label: 'Long Answer' },
									{ value: 'CODE', label: 'Code' }
								]}
							/>

							<FormField
								control={form.control}
								name="questionText"
								label="Question"
								type="textarea"
								placeholder="Enter the question text"
								required
							/>

							<FormField
								control={form.control}
								name="explanation"
								label="Explanation"
								type="textarea"
								placeholder="Explanation for the answer (optional)"
							/>

							<FormField
								control={form.control}
								name="marks"
								label="Marks"
								type="number"
								placeholder="Enter marks"
								required
							/>

							{questionType === 'MCQ' && <MCQOptionsField form={form} />}

							{questionType === 'TRUE_FALSE' && <TrueFalseOptionsField form={form} />}

							{questionType === 'CODE' && <CodeQuestionField form={form} />}
						</div>
						<SheetFooter>
							<Button
								type="submit"
								className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer"
							>
								<SquarePen className="mr-2 h-5 w-5" />
								Create Question
							</Button>

							<SheetClose asChild>
								<Button
									variant="outline"
									className="font-bold border-ab-border text-ab-text-primary cursor-pointer"
								>
									Cancel
								</Button>
							</SheetClose>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>
		</>
	);
}
