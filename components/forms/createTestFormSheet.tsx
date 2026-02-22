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
import { toast } from 'sonner';

import { useForm } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { ChaptersListTypes, SuccessResponseTypes } from '@/types';
import { SquarePen } from 'lucide-react';

type ChapterOption = {
	value: string;
	label: string;
};

type FormValues = {
	chapterId: string;
	title: string;
	durationMinutes: number;
	maxQuestions: number;
};

type Props = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
	trigger?: React.ReactNode;
};

export default function CreateTestFormSheet({ open, onOpenChange, onSuccess, trigger }: Props) {
	const [chapters, setChapters] = useState<ChapterOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<FormValues>({
		defaultValues: {
			chapterId: '',
			title: '',
			durationMinutes: 5,
			maxQuestions: 10
		}
	});

	const loadChapters = async () => {
		try {
			const res = await fetch('/api/admin/chapter', {
				credentials: 'include'
			});

			const result = (await res.json()) as SuccessResponseTypes<ChaptersListTypes[]>;

			if (result.success) {
				const options = result?.data?.map((ch: ChaptersListTypes) => ({
					value: ch.id,
					label: `${ch.course.title} • ${ch.code} • ${ch.title}`
				}));

				setChapters(options || []);
			}
		} catch (error) {
			toast.error('Failed to load chapters');
			console.error('Load chapters error:', error);
		}
	};

	useEffect(() => {
		if (open || isOpen) {
			loadChapters();
		}
	}, [open, isOpen]);

	const handleSubmit = async (data: FormValues) => {
		if (!data.chapterId || !data.title || !data.durationMinutes || !data.maxQuestions) {
			toast.error('Please fill all fields');
			return;
		}

		try {
			setLoading(true);

			const res = await fetch('/api/admin/test', {
				method: 'POST',

				headers: {
					'Content-Type': 'application/json'
				},

				credentials: 'include',

				body: JSON.stringify(data)
			});

			const result = await res.json();

			if (result.success) {
				toast.success('Test created successfully');

				form.reset();

				onSuccess?.();

				handleClose();
			} else {
				throw new Error(result.message);
			}
		} catch {
			toast.error('Failed to create test');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (value: boolean) => {
		setIsOpen(value);
		onOpenChange?.(value);
	};

	const handleClose = () => {
		setIsOpen(false);
		onOpenChange?.(false);
		form.reset();
	};

	return (
		<>
			{trigger && (
				<div onClick={() => setIsOpen(true)} className="cursor-pointer">
					<Button className="py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer">
						<SquarePen className="mr-2 h-5 w-5" />
						{trigger}
					</Button>
				</div>
			)}

			<Sheet open={trigger ? isOpen : open} onOpenChange={handleOpenChange}>
				<SheetContent className="sm:max-w-md bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">Create New Test</SheetTitle>

						<SheetDescription className="text-ab-text-secondary">
							Select chapter and configure test settings
						</SheetDescription>
					</SheetHeader>

					<div className="py-6 space-y-5">
						<FormField
							control={form.control}
							name="chapterId"
							label="Chapter"
							type="select"
							placeholder="Select chapter"
							required
							options={chapters}
						/>

						<FormField
							control={form.control}
							name="title"
							label="Test Title"
							placeholder="Introduction Test"
							required
						/>

						<FormField
							control={form.control}
							name="durationMinutes"
							label="Duration (minutes)"
							type="text"
							placeholder="5"
							required
						/>

						<FormField
							control={form.control}
							name="maxQuestions"
							label="Max Questions"
							type="text"
							placeholder="10"
							required
						/>
					</div>

					<SheetFooter className="border-t border-ab-border pt-6">
						<Button
							onClick={form.handleSubmit(handleSubmit)}
							disabled={loading}
							className="h-12 flex-1 bg-ab-primary hover:bg-ab-primary/90 font-bold rounded-xl"
						>
							<SquarePen className="mr-2 h-5 w-5" />
							{loading ? 'Creating...' : 'Create Test'}
						</Button>

						<SheetClose asChild>
							<Button variant="outline" className="h-12 font-bold rounded-xl">
								Cancel
							</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}
