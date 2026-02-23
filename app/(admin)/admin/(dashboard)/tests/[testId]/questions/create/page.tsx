import CreateQuestionPageClient from './components/CreateQuestionPageClient';

export default async function Page({ params }: { params: Promise<{ testId: string }> }) {
	const { testId } = await params;
	return <CreateQuestionPageClient testId={testId} />;
}
