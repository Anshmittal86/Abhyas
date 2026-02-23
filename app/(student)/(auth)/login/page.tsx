'use client';
import { Suspense } from 'react';
import Loader from '@/components/common/Loader';
import LoginContent from '@/components/student/auth/LoginContent';

function LoginLoading() {
	return (
		<div className="flex-1 space-y-8 p-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Preparing login page..." />
		</div>
	);
}

export default function StudentLoginInner() {
	return (
		<Suspense fallback={<LoginLoading />}>
			<LoginContent />
		</Suspense>
	);
}
