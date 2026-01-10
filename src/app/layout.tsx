import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Student Dashboard',
	description:
		'A student dashboard where students can prepare for exams, manage their account, and see all reports related to enrolled courses'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} bg-bg-main antialiased`}>{children}</body>
		</html>
	);
}
