'use client';
import { ChapterContent } from '@/components/admin/dashboard/ChapterContent';
import { Suspense } from 'react';
import Loader from '@/components/common/Loader';

function ChapterLoading() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Loading chapters..." />
		</div>
	);
}

export default function AdminChaptersPage() {
	return (
		<Suspense fallback={<ChapterLoading />}>
			<ChapterContent />
		</Suspense>
	);
}
