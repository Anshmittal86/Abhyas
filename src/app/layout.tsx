import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Abhyas',
	description:
		'A central dashboard where students can practice for exams, handle their account, and access reports for all given tests.'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} bg-bg-main antialiased`}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
