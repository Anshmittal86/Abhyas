'use client';
import { Suspense } from 'react';
import Loader from '@/components/common/Loader';
import CoursesContent from '@/components/admin/dashboard/CoursesContent';

function CoursesLoading() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Loading courses..." />
		</div>
	);
}

export default function AdminCoursesPage() {
	return (
		<Suspense fallback={<CoursesLoading />}>
			<CoursesContent />
		</Suspense>
	);
}
