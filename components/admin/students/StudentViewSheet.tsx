'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StudentFormSheet } from '@/components/forms/StudentFormSheet';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import { UserPlus2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';

type StudentDetailResponse = {
	id: string;
	provisionalNo: string;
	name: string;
	email: string;
	mobileNo: string;
	gender: string;
	dob: string | null;
	fatherName: string;
	motherName: string;
	isActive: boolean;
	registeredAt: string;
	enrollments: {
		id: string;
		courseId: string;
		course: {
			id: string;
			title: string;
		};
		enrolledAt: string;
	}[];
	testAttempts: {
		id: string;
		testId: string;
		test: {
			id: string;
			title: string;
		};
		startedAt: string;
		submittedAt: string;
		score: number;
	}[];
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	studentId: string | null;
	onBlock: (id: string) => void;
};

export default function StudentViewSheet({ open, onOpenChange, studentId, onBlock }: Props) {
	const [student, setStudent] = useState<StudentDetailResponse | null>(null);
	const [blocking, setBlocking] = useState(false);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || !studentId) return;

		const fetchStudent = async () => {
			try {
				setLoading(true);

				// -----------------------------
				// UI BRANCH MOCK DATA START
				// -----------------------------

				const mockStudent: StudentDetailResponse = {
					id: studentId,
					provisionalNo: 'STU-001',
					name: 'Ansh Mittal',
					email: 'anshmit657@gmail.com',
					mobileNo: '9876543210',
					gender: 'female',
					dob: null,
					fatherName: 'Rajesh Mittal',
					motherName: 'Sunita Mittal',
					isActive: true,
					registeredAt: new Date().toISOString(),
					enrollments: [
						{
							id: 'en1',
							courseId: 'c1',
							course: { id: 'c1', title: 'Web Development' },
							enrolledAt: new Date().toISOString()
						}
					],
					testAttempts: [
						{
							id: 't1',
							testId: 'test1',
							test: { id: 'test1', title: 'HTML' },
							startedAt: new Date().toISOString(),
							submittedAt: new Date().toISOString(),
							score: 50
						}
					]
				};

				await new Promise((resolve) => setTimeout(resolve, 500));
				setStudent(mockStudent);

				// -----------------------------
				// UI BRANCH MOCK DATA END
				// -----------------------------

				// TODO: Uncomment this in the main branch
				// const res = await fetch(`/api/admin/student/${studentId}`, {
				// 	method: 'GET',
				// 	credentials: 'include'
				// });
				// const result = await res.json();
				// if (!result?.success) {
				// 	setStudent(null);
				// 	return;
				// }
				// setStudent(result.data);
			} catch (error) {
				console.error(error);
				setStudent(null);
			} finally {
				setLoading(false);
			}
		};

		fetchStudent();
	}, [studentId, open]);

	useEffect(() => {
		if (!open) {
			setStudent(null);
		}
	}, [open]);

	if (loading) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<Loader size={35} height="full" showIcon message="Loading Details..." />
				</SheetContent>
			</Sheet>
		);
	}

	if (!student) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-2xl bg-ab-surface border-l border-ab-border">
					<p className="text-center text-ab-text-secondary py-10">Student data not available</p>
				</SheetContent>
			</Sheet>
		);
	}
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
				<SheetHeader>
					<SheetTitle className="text-ab-text-primary">Student Details</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-8">
					{/* Identity Section */}
					<div className="space-y-1">
						<p className="text-2xl font-black text-ab-text-primary">{student?.name}</p>
						<p className="text-xs font-bold text-ab-primary">{student?.provisionalNo}</p>
						<p className="text-sm text-ab-text-secondary">
							Registered on{' '}
							{student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : 'N/A'}
						</p>
					</div>

					{/* Basic Info Grid */}
					<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border p-4">
						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Email</p>
							<p className="font-black">{student?.email}</p>
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Mobile</p>
							<p className="font-black">{student?.mobileNo}</p>
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Gender</p>
							<p className="font-black">{student?.gender ?? 'Not Specified'}</p>
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Status</p>
							<p className="font-black">{student?.isActive ? 'Active' : 'Blocked'}</p>
						</div>
					</div>

					{/* Parents */}
					<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border p-4">
						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Father</p>
							<p className="font-black">{student?.fatherName || 'Not Provided'}</p>
						</div>

						<div>
							<p className="text-xs uppercase font-bold text-ab-text-secondary">Mother</p>
							<p className="font-black">{student?.motherName || 'Not Provided'}</p>
						</div>
					</div>

					{/* Enrollments */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Enrollments ({student?.enrollments?.length ?? 0})
						</p>

						{student?.enrollments?.length === 0 && (
							<p className="text-sm text-ab-text-secondary">No enrollments found</p>
						)}

						{student?.enrollments?.map((en) => (
							<div key={en.id} className="flex justify-between text-sm">
								<span className="font-black">{en.course.title}</span>
								<span className="text-ab-text-secondary">
									{new Date(en.enrolledAt).toLocaleDateString()}
								</span>
							</div>
						))}
					</div>

					{/* Test Attempts */}
					<div className="rounded-xl border border-ab-border p-4 space-y-3">
						<p className="text-xs uppercase font-bold text-ab-text-secondary">
							Test Attempts ({student?.testAttempts?.length ?? 0})
						</p>

						{student?.testAttempts?.length === 0 && (
							<p className="text-sm text-ab-text-secondary">No attempts yet</p>
						)}

						{student?.testAttempts?.map((attempt) => (
							<div key={attempt?.id} className="flex justify-between text-sm">
								<div>
									<p className="font-black">{attempt?.test?.title}</p>
									<p className="text-xs text-ab-text-secondary">
										{new Date(attempt?.startedAt).toLocaleDateString()}
									</p>
								</div>
								<p className="font-black">{attempt?.score} Marks</p>
							</div>
						))}
					</div>

					{/* Actions */}
					<div className="flex gap-2 pt-4">
						<StudentFormSheet
							mode="update"
							defaultValues={{
								provisionalNo: student?.provisionalNo ?? '',
								name: student?.name ?? '',
								email: student?.email ?? '',
								mobileNo: student?.mobileNo ?? '',
								dob: student?.dob ? new Date(student.dob) : undefined,
								course: student?.enrollments?.[0]?.course?.title ?? '',
								fathersName: student?.fatherName ?? '',
								mothersName: student?.motherName ?? ''
							}}
							trigger={
								<Button variant="outline" className="font-bold">
									<UserPlus2 className="h-5 w-5" />
									Update Student
								</Button>
							}
						/>

						<AlertDialogBox
							name={student?.name || ''}
							onConfirm={async () => {
								if (!student) return;

								try {
									setBlocking(true);
									await onBlock(student.id);

									setStudent((prev) => (prev ? { ...prev, isActive: false } : prev));
								} finally {
									setBlocking(false);
								}
							}}
							trigger={
								<Button
									variant="outline"
									disabled={blocking}
									className="font-bold text-ab-pink-text"
								>
									Block Student
								</Button>
							}
						/>

						<SheetClose asChild>
							<Button variant="outline">Close</Button>
						</SheetClose>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
