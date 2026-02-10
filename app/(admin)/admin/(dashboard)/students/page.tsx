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
import { CreateStudentSheet } from '@/components/forms/CreateStudentSheet';

const students = [
	{
		name: 'Ansh Mittal',
		id: 'ST-001',
		email: 'anshmit657@gmail.com',
		attempts: 12,
		status: 'Active'
	}
];

export default function StudentsPage() {
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
											<DropdownMenuItem className="cursor-pointer font-bold">
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
		</div>
	);
}
