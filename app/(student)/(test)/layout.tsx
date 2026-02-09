'use client';

export default function TestLayout({ children }: { children: React.ReactNode }) {
	return <div className="min-h-screen bg-ab-bg text-ab-text-primary flex flex-col">{children}</div>;
}
