import { Suspense } from 'react';
import Loader from '@/components/common/Loader';
import { QuestionsContent } from '@/components/admin/dashboard/QuestionContent';

function QuestionsLoading() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6 bg-ab-bg text-ab-text-primary flex items-center justify-center min-h-150">
			<Loader height="full" message="Loading questions..." />
		</div>
	);
}

export default function AdminQuestionsPage() {
	return (
		<Suspense fallback={<QuestionsLoading />}>
			<QuestionsContent />
		</Suspense>
	);
}
