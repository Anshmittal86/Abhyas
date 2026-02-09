import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Abyash',
	description:
		'A central dashboard where students can practice for exams, handle their account, and access reports for all given tests.'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light" suppressHydrationWarning>
			<body className={`${inter.variable} bg-bg-main antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	);
}
