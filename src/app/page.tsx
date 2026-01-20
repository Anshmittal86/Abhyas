import { ReactNode } from 'react';
import StudentPage from '@/src/app/(auth)/student-login/page';

const page = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<StudentPage />
			<span className="bg-brand-softer text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">
				Brand
			</span>
			{children}
		</>
	);
};

export default page;
