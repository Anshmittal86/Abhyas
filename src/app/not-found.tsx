import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Hammer } from 'lucide-react';
import Link from 'next/link';

const AccentButton = ({ children, href }: { children: React.ReactNode; href: string }) => (
	<Link
		href={href}
		className="mt-6 inline-flex items-center px-4 py-2 border border-amber-600 text-sm font-medium rounded-md shadow-sm text-amber-50 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
	>
		{children}
	</Link>
);

export default function NotFound() {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
			<Empty className="p-8 bg-gray-900 shadow-xl rounded-lg max-w-lg text-center border border-gray-800">
				<EmptyHeader>
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-white">
						<Hammer className="h-8 w-8" />
					</div>

					<EmptyTitle className="text-3xl font-extrabold text-white">Coming Soon!</EmptyTitle>

					<EmptyDescription className="mt-2 text-gray-400">
						We are working hard to bring this page to life. Please check back later.
					</EmptyDescription>
				</EmptyHeader>

				<AccentButton href="/">Return to Homepage</AccentButton>
			</Empty>
		</div>
	);
}
