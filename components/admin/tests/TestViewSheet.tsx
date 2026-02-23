'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';

import { useState, useEffect } from 'react';
import { TestDetailsTypes } from '@/types';
import { SuccessResponseTypes } from '@/types';
import { toast } from 'sonner';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	testId: string | null;
	onTitleUpdated?: (testId: string, newTitle: string) => void;
};

export default function TestViewSheet({ open, onOpenChange, testId, onTitleUpdated }: Props) {
	const [test, setTest] = useState<TestDetailsTypes | null>(null);
	const [loading, setLoading] = useState(false);

	const [editOpen, setEditOpen] = useState(false);
	const [newTitle, setNewTitle] = useState('');
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		if (!open || !testId) return;

		const fetchTest = async () => {
			try {
				setLoading(true);

				const response = await fetch(`/api/admin/test/${testId}`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = (await response.json()) as SuccessResponseTypes<TestDetailsTypes>;

				if (result.success) {
					setTest(result.data || null);
				} else {
					setTest(null);
				}
			} catch (error) {
				toast.error('Failed to fetch test details');
				console.error('Fetch test details error:', error);
				setTest(null);
			} finally {
				setLoading(false);
			}
		};

		fetchTest();
	}, [testId, open]);

	useEffect(() => {
		if (test) {
			setNewTitle(test.title);
		}

		if (!open) {
			setTest(null);
		}
	}, [open, test]);

	const handleUpdateTitle = async () => {
		if (!newTitle.trim()) {
			toast.error('Title cannot be empty');
			return;
		}

		if (newTitle === test?.title) {
			setEditOpen(false);
			return;
		}

		try {
			setUpdating(true);

			const res = await fetch(`/api/admin/test/${test?.id}`, {
				method: 'PATCH',

				headers: {
					'Content-Type': 'application/json'
				},

				credentials: 'include',

				body: JSON.stringify({
					title: newTitle
				})
			});

			const result = (await res.json()) as SuccessResponseTypes<TestDetailsTypes>;

			if (result.success) {
				toast.success('Test title updated');

				setTest((prev) => (prev ? { ...prev, title: newTitle } : prev));

				onTitleUpdated?.(result.data?.id || '', newTitle);

				setEditOpen(false);
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Update failed';

			toast.error(message);
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<Loader height="full" message="Loading Test Details..." />
				</SheetContent>
			</Sheet>
		);
	}

	if (!test) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<p className="text-center text-ab-text-secondary py-10 font-medium">
						Test data not available
					</p>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-4xl h-screen overflow-y-auto bg-ab-surface border-l border-ab-border">
				{/* Header */}
				<SheetHeader>
					<SheetTitle className="text-xl font-black text-ab-text-primary tracking-tight">
						Test Details
					</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Identity */}
					<Card className="bg-ab-surface border-ab-border shadow-sm">
						<CardHeader>
							<CardTitle className="text-ab-text-primary text-lg font-black flex items-center gap-3">
								<span className="text-2xl font-black text-ab-text-primary">{test.title}</span>

								<Dialog open={editOpen} onOpenChange={setEditOpen}>
									<DialogTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-ab-primary/10">
											<Pencil className="h-4 w-4 text-ab-text-secondary" />
										</Button>
									</DialogTrigger>

									<DialogContent className="bg-ab-surface border-ab-border">
										<DialogHeader>
											<DialogTitle className="text-ab-text-primary">Update Test Title</DialogTitle>
										</DialogHeader>

										<div className="space-y-3 pt-2">
											<Label className="text-xs font-bold text-ab-text-secondary">Test Title</Label>

											<Input
												value={newTitle}
												onChange={(e) => setNewTitle(e.target.value)}
												className="border-ab-border"
											/>
										</div>

										<DialogFooter className="pt-4">
											<Button variant="outline" onClick={() => setEditOpen(false)}>
												Cancel
											</Button>

											<Button
												onClick={handleUpdateTitle}
												disabled={updating}
												className="bg-ab-primary hover:bg-ab-primary/90"
											>
												{updating ? 'Updating...' : 'Update'}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-1 text-sm">
							<p className="text-ab-text-secondary font-medium">
								Chapter: {test.chapter.title} ({test.chapter.code})
							</p>

							<p className="text-ab-text-secondary font-medium">
								Course: {test.chapter.course.title}
							</p>

							<p className="text-ab-text-secondary font-medium">
								Created on {new Date(test.createdAt).toLocaleDateString()}
							</p>
						</CardContent>
					</Card>

					{/* Metrics */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Card className="bg-ab-surface border-ab-border">
							<CardContent className="p-4">
								<p className="text-xs text-ab-text-secondary uppercase font-bold tracking-wide">
									Duration
								</p>
								<p className="font-black text-ab-text-primary text-lg">
									{test.durationMinutes} min
								</p>
							</CardContent>
						</Card>

						<Card className="bg-ab-surface border-ab-border">
							<CardContent className="p-4">
								<p className="text-xs text-ab-text-secondary uppercase font-bold tracking-wide">
									Max Questions
								</p>
								<p className="font-black text-ab-text-primary text-lg">{test.maxQuestions}</p>
							</CardContent>
						</Card>

						<Card className="bg-ab-surface border-ab-border">
							<CardContent className="p-4">
								<p className="text-xs text-ab-text-secondary uppercase font-bold tracking-wide">
									Current Questions
								</p>
								<p className="font-black text-ab-text-primary text-lg">{test.questionCount}</p>
							</CardContent>
						</Card>

						<Card className="bg-ab-surface border-ab-border">
							<CardContent className="p-4">
								<p className="text-xs text-ab-text-secondary uppercase font-bold tracking-wide">
									Attempts
								</p>
								<p className="font-black text-ab-text-primary text-lg">{test.attemptCount}</p>
							</CardContent>
						</Card>
					</div>

					{/* Questions Preview */}
					<Card className="bg-ab-surface border-ab-border">
						<CardHeader>
							<CardTitle className="text-ab-text-primary text-base font-black">
								Questions Preview
							</CardTitle>
						</CardHeader>

						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-ab-border/20">
									<TableRow>
										<TableHead className="font-bold text-ab-text-secondary">#</TableHead>

										<TableHead className="font-bold text-ab-text-secondary">Question</TableHead>

										<TableHead className="font-bold text-ab-text-secondary">Type</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{test.questions.map((q, index) => (
										<TableRow key={q.id} className="hover:bg-ab-primary/5">
											<TableCell className="font-bold text-ab-text-secondary">
												{index + 1}
											</TableCell>

											<TableCell className="font-medium text-ab-text-primary">
												{q.questionText}
											</TableCell>

											<TableCell>
												{/* status pill safe */}
												<Badge
													className="
														bg-ab-blue-bg
														text-ab-blue-text
														border-none
														font-bold
														rounded-full
														px-3
													"
												>
													{q.questionType}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Admin Info */}
					<Card className="bg-ab-surface border-ab-border">
						<CardHeader>
							<CardTitle className="text-ab-text-primary text-base font-black">
								Created By
							</CardTitle>
						</CardHeader>

						<CardContent className="text-sm">
							<p className="font-bold text-ab-text-primary">{test.admin.name}</p>

							<p className="text-ab-text-secondary">{test.admin.email}</p>
						</CardContent>
					</Card>

					{/* Footer Actions */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							className="
								border-ab-border
								font-bold
								text-ab-text-primary
								hover:bg-ab-primary/10
							"
						>
							Update Test
						</Button>

						<Button
							variant="outline"
							className="
								border-ab-border
								font-bold
								text-ab-pink-text
								hover:bg-ab-pink-bg/40
							"
						>
							Delete Test
						</Button>

						<SheetClose asChild>
							<Button
								variant="outline"
								className="
									border-ab-border
									font-bold
									text-ab-text-secondary
								"
							>
								Close
							</Button>
						</SheetClose>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
