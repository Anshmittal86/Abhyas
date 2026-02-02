// // Test Player (questions UI)

'use client';

import { redirect } from 'next/navigation';

export default function TestEntryPage({ params }: { params: { testId: string } }) {
	redirect(`/student/test/${params.testId}/attempt`);
}
