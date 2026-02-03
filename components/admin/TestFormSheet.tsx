'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import FormField from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle
} from '@/components/ui/sheet';
import { apiFetch } from '@/lib/apiFetch';

const testFormSchema = z.object({
	chapterId: z.string().uuid('Please select a chapter'),
	title: z.string().min(3, 'Test title is required'),
	durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute'),
	totalQuestions: z.number().int().min(1, 'Total questions must be at least 1')
});

type TestFormValues = z.infer<typeof testFormSchema>;

export type TestFormSheetMode = 'create' | 'edit';

export type TestForEdit = {
	id: string;
	chapterId: string;
	title: string;
	durationMinutes: number;
	totalQuestions: number;
};

type ChapterOption = {
	id: string;
	code: string;
	title: string;
	courseTitle: string;
};

type TestFormSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: TestFormSheetMode;
	test?: TestForEdit | null;
	onSuccess: () => void | Promise<void>;
};

export function TestFormSheet({ open, onOpenChange, mode, test, onSuccess }: TestFormSheetProps) {
	const [chapters, setChapters] = useState<ChapterOption[]>([]);
	const [chaptersLoading, setChaptersLoading] = useState(false);

	const form = useForm<TestFormValues>({
		resolver: zodResolver(testFormSchema),
		defaultValues: {
			chapterId: '',
			title: '',
			durationMinutes: 60,
			totalQuestions: 10
		}
	});

	const [submitting, setSubmitting] = useState(false);
	const canSubmit = useMemo(() => !submitting, [submitting]);
	const isEdit = mode === 'edit';

	useEffect(() => {
		const loadChapters = async () => {
			setChaptersLoading(true);
			try {
				const res = await apiFetch('/api/admin/chapter', {
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) throw new Error(`API error: ${res.status}`);
				const result = await res.json();
				const data: Array<{
					id: string;
					code: string;
					title: string;
					course: { id: string; title: string };
				}> = result.data ?? [];
				setChapters(
					data.map((ch) => ({
						id: ch.id,
						code: ch.code,
						title: ch.title,
						courseTitle: ch.course.title
					}))
				);
			} catch (error) {
				if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
					window.location.href = '/admin-login';
					return;
				}
				console.error('Load chapters error:', error);
			} finally {
				setChaptersLoading(false);
			}
		};

		if (open) {
			void loadChapters();
		}
	}, [open]);

	useEffect(() => {
		if (open && test && isEdit) {
			form.reset({
				chapterId: test.chapterId,
				title: test.title,
				durationMinutes: test.durationMinutes,
				totalQuestions: test.totalQuestions
			});
		}
		if (open && !isEdit) {
			form.reset({
				chapterId: '',
				title: '',
				durationMinutes: 60,
				totalQuestions: 10
			});
		}
	}, [open, isEdit, test, form]);

	const handleClose = () => {
		onOpenChange(false);
		form.reset();
	};

	const onSubmit = async (values: TestFormValues) => {
		if (!canSubmit) return;
		setSubmitting(true);
		try {
			if (isEdit && test) {
				const response = await apiFetch(`/api/admin/test/${test.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: values.title,
						durationMinutes: values.durationMinutes,
						totalQuestions: values.totalQuestions
					})
				});
				if (!response.ok) throw new Error(`API error: ${response.status}`);
			} else {
				const response = await apiFetch('/api/admin/test', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						chapterId: values.chapterId,
						title: values.title,
						durationMinutes: values.durationMinutes,
						totalQuestions: values.totalQuestions
					})
				});
				if (!response.ok) throw new Error(`API error: ${response.status}`);
			}
			await onSuccess();
			handleClose();
		} catch (error) {
			if (error instanceof Error && error.message === 'AUTH_EXPIRED') {
				window.location.href = '/admin-login';
				return;
			}
			console.error('Test save error:', error);
		} finally {
			setSubmitting(false);
		}
	};

	const chapterOptions = chapters.map((ch) => ({
		value: ch.id,
		label: `${ch.courseTitle} - ${ch.title} (${ch.code})`
	}));

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				className="w-full sm:max-w-lg bg-surface border-l border-default z-60"
				style={{
					backgroundColor: 'var(--color-bg-surface)',
					borderColor: 'var(--color-border-default)'
				}}
			>
				<SheetHeader>
					<SheetTitle className="text-primary">{isEdit ? 'Edit Test' : 'Create Test'}</SheetTitle>
				</SheetHeader>

				<form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					{!isEdit && (
						<FormField
							control={form.control}
							name="chapterId"
							label="Chapter"
							placeholder={chaptersLoading ? 'Loading chapters...' : 'Select a chapter'}
							type="select"
							required
							options={chapterOptions}
						/>
					)}
					<FormField
						control={form.control}
						name="title"
						label="Title"
						placeholder="Test title"
						required
					/>

					<Controller
						name="durationMinutes"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="space-y-1">
								<label className="text-sm" style={{ color: 'var(--color-secondary)' }}>
									Duration (minutes)
								</label>
								<Input
									type="number"
									min={1}
									value={field.value}
									onChange={(e) => {
										const n = parseInt(e.target.value, 10);
										field.onChange(Number.isNaN(n) ? 1 : Math.max(1, n));
									}}
									placeholder="60"
									className="w-full"
									style={{
										backgroundColor: 'var(--color-bg-surface)',
										borderColor: 'var(--color-border-default)',
										color: 'var(--color-primary)'
									}}
								/>
								{fieldState.error && (
									<p className="text-sm" style={{ color: 'var(--color-accent-error)' }}>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						name="totalQuestions"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="space-y-1">
								<label className="text-sm" style={{ color: 'var(--color-secondary)' }}>
									Total Questions
								</label>
								<Input
									type="number"
									min={1}
									value={field.value}
									onChange={(e) => {
										const n = parseInt(e.target.value, 10);
										field.onChange(Number.isNaN(n) ? 1 : Math.max(1, n));
									}}
									placeholder="10"
									className="w-full"
									style={{
										backgroundColor: 'var(--color-bg-surface)',
										borderColor: 'var(--color-border-default)',
										color: 'var(--color-primary)'
									}}
								/>
								{fieldState.error && (
									<p className="text-sm" style={{ color: 'var(--color-accent-error)' }}>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>

					<SheetFooter className="pt-2">
						<SheetClose asChild>
							<Button
								type="button"
								variant="outline"
								className="cursor-pointer"
								onClick={handleClose}
							>
								Cancel
							</Button>
						</SheetClose>
						<Button type="submit" className="cursor-pointer" disabled={submitting}>
							{submitting ?
								isEdit ?
									'Saving…'
								:	'Creating…'
							: isEdit ?
								'Save'
							:	'Create'}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
