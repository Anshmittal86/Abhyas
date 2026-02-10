'use client';

import { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { CreateStudentSheet } from '@/components/forms/CreateStudentSheet';

type StudentDetail = {
	id: string;
	name: string;
	email: string;
	attempts: number;
	status: 'Active' | 'Blocked';
	provisionalNo: string;
	course: string;
	dob: string;
	mobileNo: string;
	fathersName: string;
	mothersName: string;
};

const DUMMY_STUDENT: StudentDetail = {
	id: 'ST-001',
	name: 'Ansh Mittal',
	email: 'anshmit657@gmail.com',
	attempts: 12,
	status: 'Active',
	provisionalNo: 'P-2024-001',
	course: 'Web Development',
	dob: '2002-08-15',
	mobileNo: '+91 9876543210',
	fathersName: 'Rajesh Mittal',
	mothersName: 'Sunita Mittal'
};

export default function StudentsPage() {
	const [viewOpen, setViewOpen] = useState(false);
	const DUMMY_STUDENTS: StudentDetail[] = [DUMMY_STUDENT];
	const [students, setStudents] = useState<StudentDetail[]>(DUMMY_STUDENTS);
	const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(DUMMY_STUDENT);

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

				<CreateStudentSheet classes={'cursor-pointer'} />
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
						{students.map((student) => (
							<TableRow key={student.id} className="group transition-colors hover:bg-ab-primary/5">
								<TableCell className="py-5 pl-8">
									<div className="flex flex-col">
										<span className="text-[15px] font-black text-ab-text-primary">
											{student.name}
										</span>
										<span className="text-[10px] font-bold uppercase tracking-tighter text-ab-primary">
											{student.id}
										</span>
									</div>
								</TableCell>

								<TableCell className="font-medium text-ab-text-secondary">
									{student.email}
								</TableCell>

								<TableCell className="text-center">
									<span className="text-sm font-black">{student.attempts}</span>
								</TableCell>

								<TableCell>
									<Badge
										className={`rounded-lg border-none px-3 py-1 font-bold shadow-none ${
											student.status === 'Active' ?
												'bg-ab-green-bg text-ab-green-text'
											:	'bg-ab-pink-bg text-ab-pink-text'
										}`}
									>
										{student.status}
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
											className="rounded-xl border-2 border-ab-border/80"
										>
											<DropdownMenuItem
												className="cursor-pointer font-bold"
												onClick={() => {
													setSelectedStudent(student);
													setViewOpen(true);
												}}
											>
												View Profile
											</DropdownMenuItem>
											<DropdownMenuItem className="cursor-pointer font-bold text-ab-pink-text">
												Block Student
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Sheet open={viewOpen} onOpenChange={setViewOpen}>
				<SheetContent className="sm:max-w-2xl overflow-y-auto bg-ab-surface border-l border-ab-border">
					<SheetHeader>
						<SheetTitle className="text-ab-text-primary">Student Details</SheetTitle>
					</SheetHeader>

					{selectedStudent && (
						<div className="mt-6 space-y-6">
							{/* Student Identity */}
							<div className="space-y-1">
								<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
									Student Name
								</p>
								<p className="text-lg font-black text-ab-text-primary">{selectedStudent.name}</p>
								<p className="text-xs font-bold text-ab-primary">{selectedStudent.id}</p>
							</div>

							{/* Contact & Course */}
							<div className="space-y-1">
								<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
									Contact & Course
								</p>
								<p className="font-medium text-ab-text-primary">{selectedStudent.email}</p>
								<p className="text-sm text-ab-text-secondary">Course: {selectedStudent.course}</p>
							</div>

							{/* Key Metrics */}
							<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border bg-ab-surface p-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Attempts
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedStudent.attempts}
									</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Status
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedStudent.status}
									</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Date of Birth
									</p>
									<p className="text-base font-black text-ab-text-primary">{selectedStudent.dob}</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Mobile No.
									</p>
									<p className="text-base font-black text-ab-text-primary">
										{selectedStudent.mobileNo}
									</p>
								</div>
							</div>

							{/* Parents */}
							<div className="grid grid-cols-2 gap-4 rounded-xl border border-ab-border p-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Father’s Name
									</p>
									<p className="font-black text-ab-text-primary">{selectedStudent.fathersName}</p>
								</div>

								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-ab-text-secondary">
										Mother’s Name
									</p>
									<p className="font-black text-ab-text-primary">{selectedStudent.mothersName}</p>
								</div>
							</div>

							{/* Actions */}
							<div className="pt-4 flex gap-2">
								<Button
									variant="outline"
									className="font-bold border-ab-border text-ab-text-primary hover:bg-ab-primary/10"
								>
									Update Student
								</Button>

								<Button
									variant="outline"
									className="font-bold text-ab-pink-text border-ab-border hover:bg-ab-pink-bg"
								>
									Block Student
								</Button>

								<SheetClose asChild>
									<Button variant="outline" className="border-ab-border text-ab-text-primary">
										Close
									</Button>
								</SheetClose>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
