// Custom TEST layout (NO sidebar)
'use client';

export default function TestLayout({ children }: { children: React.ReactNode }) {
	return <div className="min-h-screen bg-main text-primary flex flex-col">{children}</div>;
}
