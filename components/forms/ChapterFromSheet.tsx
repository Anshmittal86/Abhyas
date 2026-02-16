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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CoursesListTypes } from '@/types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { fetchCourses } from '@/lib/api';

type Props = {
	mode: 'create' | 'update';
	chapterId?: string;
	courseId?: string; // Only for CREATE mode
	defaultValues?: Partial<any>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
	trigger?: React.ReactNode;
};

export default function ChapterFormSheet({
	mode,
	chapterId,
	courseId: initialCourseId,
	defaultValues,
	open,
	onOpenChange,
	onSuccess,
	trigger
}: Props) {
	const [courses, setCourses] = useState<CoursesListTypes[]>([]);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		courseId: '',
		code: '',
		title: '',
		orderNo: ''
	});
	const [isOpen, setIsOpen] = useState(false);

	// Load courses only for create mode
	useEffect(() => {
		if (mode === 'create') {
			loadCourses();
		}
	}, [mode]);

	// Set form data when opening
	useEffect(() => {
		// ✅ जब भी defaultValues या chapterId change हो, form update हो
		if (open || isOpen) {
			setFormData({
				courseId: initialCourseId || defaultValues?.courseId || '',
				code: defaultValues?.code || '',
				title: defaultValues?.title || '',
				orderNo: defaultValues?.orderNo?.toString() || ''
			});
		}
	}, [open, isOpen, defaultValues, chapterId, initialCourseId, mode]);

	useEffect(() => {
		if (!open && !isOpen) {
			setFormData({
				courseId: '',
				code: '',
				title: '',
				orderNo: ''
			});
		}
	}, [open, isOpen]);

	const loadCourses = async () => {
		try {
			const coursesData = await fetchCourses();
			setCourses(coursesData || []);
		} catch (error) {
			toast.error('Failed to load courses');
		}
	};

	const handleSubmit = async () => {
		// Create mode: All fields required
		if (
			mode === 'create' &&
			(!formData.courseId || !formData.code || !formData.title || !formData.orderNo)
		) {
			toast.error('Please fill all fields');
			return;
		}

		// Update mode: Only code, title, orderNo required
		if (mode === 'update' && (!formData.code || !formData.title || !formData.orderNo)) {
			toast.error('Please fill all fields');
			return;
		}

		setLoading(true);
		try {
			// Create: Send courseId + other fields
			// Update: Send ONLY code, title, orderNo (no courseId)
			const body =
				mode === 'create' ?
					{
						courseId: formData.courseId,
						code: formData.code,
						title: formData.title,
						orderNo: parseInt(formData.orderNo)
					}
				:	{
						// Update - NO courseId
						code: formData.code,
						title: formData.title,
						orderNo: parseInt(formData.orderNo)
					};

			const url = mode === 'create' ? '/api/admin/chapter' : `/api/admin/chapter/${chapterId}`;

			const res = await fetch(url, {
				method: mode === 'create' ? 'POST' : 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			});

			const result = await res.json();

			if (result.success) {
				toast.success(
					result.message || `Chapter ${mode === 'create' ? 'created' : 'updated'} successfully`
				);
				onSuccess?.();
				handleClose();
			} else {
				throw new Error(result.message || 'Failed to process request');
			}
		} catch (error) {
			toast.error('Failed to save chapter');
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
	};

	const isCreateMode = mode === 'create';

	return (
		<>
			{trigger && (
				<div onClick={() => setIsOpen(true)} className="cursor-pointer">
					{trigger}
				</div>
			)}

			<Sheet open={trigger ? isOpen : (open ?? false)} onOpenChange={handleOpenChange}>
				<SheetContent className="sm:max-w-md bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">
							{isCreateMode ? 'Create New Chapter' : 'Update Chapter'}
						</SheetTitle>
						<SheetDescription className="text-ab-text-secondary">
							{isCreateMode ?
								'Select course and add chapter details'
							:	'Update chapter code, title and order'}
						</SheetDescription>
					</SheetHeader>

					<div className="py-4 space-y-6">
						{/* ✅ Course dropdown ONLY in CREATE mode */}
						{isCreateMode && (
							<div className="space-y-2">
								<Label className="text-xs font-bold uppercase text-ab-text-secondary">
									Course *
								</Label>
								<Select
									value={formData.courseId}
									onValueChange={(value) => setFormData((prev) => ({ ...prev, courseId: value }))}
								>
									<SelectTrigger className="h-12 rounded-xl border-2 border-ab-border/80">
										<SelectValue placeholder="Select course" />
									</SelectTrigger>
									<SelectContent className="bg-ab-surface border-ab-border max-h-60">
										{courses.map((course) => (
											<SelectItem key={course.id} value={course.id}>
												{course.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Common fields - Always show */}
						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase text-ab-text-secondary">
								Chapter Code *
							</Label>
							<Input
								value={formData.code}
								onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
								placeholder="M1, 01, CH1"
								className="h-12 rounded-xl border-2 border-ab-border/80 focus-visible:ring-ab-primary/20"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase text-ab-text-secondary">
								Chapter Title *
							</Label>
							<Input
								value={formData.title}
								onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
								placeholder="Enter chapter title"
								className="h-12 rounded-xl border-2 border-ab-border/80 focus-visible:ring-ab-primary/20"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase text-ab-text-secondary">
								Order Number *
							</Label>
							<Input
								type="number"
								value={formData.orderNo}
								onChange={(e) => setFormData((prev) => ({ ...prev, orderNo: e.target.value }))}
								placeholder="1"
								min={1}
								className="h-12 rounded-xl border-2 border-ab-border/80 focus-visible:ring-ab-primary/20"
							/>
						</div>
					</div>

					<SheetFooter className="pt-6 border-t border-ab-border">
						<Button
							onClick={handleSubmit}
							disabled={loading}
							className="h-12 bg-ab-primary hover:bg-ab-primary/90 font-bold rounded-xl flex-1"
						>
							{loading ?
								'Processing...'
							: isCreateMode ?
								'Create Chapter'
							:	'Update Chapter'}
						</Button>
						<SheetClose asChild>
							<Button type="button" variant="outline" className="h-12 font-bold rounded-xl">
								Cancel
							</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}
