import { Suspense } from 'react';
import StudentLoginInner from './components/StudentLoginInner';

export default function StudentLoginPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<StudentLoginInner />
		</Suspense>
	);
}
