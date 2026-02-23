'use client';

import { Suspense } from 'react';
import Loader from '@/components/common/Loader';
import StudentContent from '@/components/admin/dashboard/StudentContent';

function StudentsLoading() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Loading students..." />
		</div>
	);
}

export default function StudentsPage() {
	return (
		<Suspense fallback={<StudentsLoading />}>
			<StudentContent />
		</Suspense>
	);
}
