'use client';
// ✅
import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, UserPlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StudentFormSheet } from '@/components/forms/StudentFormSheet';
import AlertDialogBox from '@/components/common/AlertDialogBox';
import { toast } from 'sonner';
import StudentViewSheet from '@/components/admin/students/StudentViewSheet';
import Loader from '@/components/common/Loader';

type StudentDetails = {
	id: string;
	provisionalNo: string;
	name: string;
	email: string;
	mobileNo: string;
	gender: string;
	isActive: boolean;
	enrollmentCount: number;
	testAttemptCount: number;
	registeredAt: string;
};

export default function StudentsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const [students, setStudents] = useState<StudentDetails[]>([]);
	const [blocking, setBlocking] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const [loading, setLoading] = useState(false);

	const fetchStudents = async () => {
		setLoading(true);
		try {
			// -----------------------------
			// UI BRANCH MOCK DATA START
			// -----------------------------

			setStudents([
				{
					id: '1',
					provisionalNo: 'STU-001',
					name: 'Ansh Mittal',
					email: 'ansh@example.com',
					mobileNo: '9876543210',
					gender: 'male',
					isActive: true,
					enrollmentCount: 2,
					testAttemptCount: 5,
					registeredAt: new Date().toISOString()
				}
			]);

			// -----------------------------
			// UI BRANCH MOCK DATA END
			// -----------------------------

			// TODO: Uncomment this in the main branch
			// const res = await fetch('/api/admin/student', {
			// 	method: 'GET',
			// 	credentials: 'include'
			// });
			// if (!res.ok) {
			// 	throw new Error('Network response was not ok');
			// }
			// const result = await res.json();
			// if (!result?.success || !Array.isArray(result.data)) {
			// 	toast.error(result?.message || 'Invalid server response');
			// 	return;
			// }
			// setStudents(result.data);
		} catch (error) {
			console.error(error);
			toast.error('Failed to fetch students');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudents();
	}, []);

	const handleBlockStudent = async (id: string) => {
		try {
			// TODO: Connect with Actual Block API
			// await fetch(`/api/admin/students/${id}/block`, {
			// 	method: 'PATCH'
			// });

			setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)));

			toast.success('Student blocked successfully');
		} catch {
			toast.error('Failed to block student');
		}
	};

	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-black tracking-tight">Students</h2>
					<p className="text-sm font-medium italic text-ab-text-secondary">
						Create students and view basic enrollment and practice activity.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex justify-between items-center gap-4">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ab-text-secondary" />
					<Input
						placeholder="Search by name or ID..."
						className="h-11 rounded-xl border-2 border-ab-border/80 pl-10 focus-visible:ring-ab-primary/20"
					/>
				</div>

				<StudentFormSheet
					trigger={
						<Button
							variant="outline"
							className={`py-4 px-5 bg-ab-primary hover:bg-ab-primary/90 text-primary-foreground font-bold text-md rounded-full shadow-lg shadow-ab-primary/20 transition-all active:scale-95 cursor-pointer `}
						>
							<UserPlus2 className="h-5 w-5" />
							Create Student
						</Button>
					}
				/>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[22px] border-2 border-ab-border/80 bg-ab-surface shadow-sm">
				<Table>
					<TableHeader className="bg-ab-border/20">
						<TableRow className="border-b-2 hover:bg-transparent">
							<TableHead className="w-75 py-5 pl-8 text-[11px] font-black uppercase tracking-widest">
								Student Name
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Email Address
							</TableHead>
							<TableHead className="text-center text-[11px] font-black uppercase tracking-widest">
								Attempts
							</TableHead>
							<TableHead className="text-[11px] font-black uppercase tracking-widest">
								Status
							</TableHead>
							<TableHead className="pr-8 text-right text-[11px] font-black uppercase tracking-widest">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ?
							<TableRow>
								<TableCell colSpan={5} className="text-center py-10">
									<Loader size={30} showIcon message="Loading students..." />
								</TableCell>
							</TableRow>
						:	Array.isArray(students) &&
							students.map((student) => (
								<TableRow
									key={student.id}
									className="group transition-colors hover:bg-ab-primary/5"
								>
									<TableCell className="py-5 pl-8">
										<div className="flex flex-col">
											<span className="text-[15px] font-black text-ab-text-primary">
												{student.name}
											</span>
											<span className="text-[10px] font-bold uppercase tracking-tighter text-ab-primary">
												{student.provisionalNo}
											</span>
										</div>
									</TableCell>

									<TableCell className="font-medium text-ab-text-secondary">
										{student.email}
									</TableCell>

									<TableCell className="text-center">
										<span className="text-sm font-black">{student.testAttemptCount}</span>
									</TableCell>

									<TableCell>
										<Badge
											className={`rounded-lg border-none px-3 py-1 font-bold shadow-none ${
												student.isActive ?
													'bg-ab-green-bg text-ab-green-text'
												:	'bg-ab-pink-bg text-ab-pink-text'
											}`}
										>
											{student.isActive ? 'Active' : 'Blocked'}
										</Badge>
									</TableCell>

									<TableCell className="pr-8 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0 transition hover:bg-ab-primary/10 hover:text-ab-primary"
												>
													<MoreHorizontal className="h-5 w-5" />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align="end"
												className="rounded-xl border-2 border-ab-border/80 text-center"
											>
												<DropdownMenuItem
													className="cursor-pointer font-bold flex justify-center"
													onClick={() => {
														setSelectedId(student.id);
														setViewOpen(true);
													}}
												>
													View Profile
												</DropdownMenuItem>

												<AlertDialogBox
													name={student.name}
													onConfirm={async () => {
														await handleBlockStudent(student.id);
													}}
													trigger={
														<Button
															variant="ghost"
															className="w-full flex justify-center font-bold text-ab-pink-text hover:bg-ab-pink-bg/50 h-8 px-2 "
														>
															Block Student
														</Button>
													}
												/>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</div>

			<StudentViewSheet
				open={viewOpen}
				onOpenChange={setViewOpen}
				studentId={selectedId}
				onBlock={handleBlockStudent}
			/>
		</div>
	);
}
