'use client';
import { Suspense } from 'react';
import Loader from '@/components/common/Loader';
import TestsContent from '@/components/admin/dashboard/TestsContent';

function TestsLoading() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Loading tests..." />
		</div>
	);
}

export default function AdminTestsPage() {
	return (
		<Suspense fallback={<TestsLoading />}>
			<TestsContent />
		</Suspense>
	);
}
