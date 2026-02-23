'use client';
// ✅
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, UserCheck, FileEdit, Zap, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/landing/Header';

export default function LandingPage() {
	return (
		<main className="min-h-screen bg-ab-bg text-ab-text-primary font-sans selection:bg-ab-primary selection:text-primary-foreground">
			<div className="mx-auto max-w-[1280px]">
				<Header />

				{/* Hero Section */}
				<section className="relative overflow-hidden pb-32 pt-24">
					<div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-ab-primary/10 blur-[120px]" />

					<div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
						<div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-ab-border bg-ab-primary/5 px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-ab-primary">
								Official Learning Resource
							</span>
						</div>

						<h1 className="mb-6 text-balance text-5xl font-black leading-none tracking-tight md:text-7xl md:leading-tight">
							Tech Masters Institute <br />
							<span className="italic text-ab-primary">Abyash Portal</span>
						</h1>

						<p className="mx-auto mb-10 max-w-3xl text-lg font-medium leading-relaxed text-ab-text-secondary md:text-xl">
							A dedicated practice environment designed for our students. This portal enables staff
							to curate course-specific assessments and allows students to validate their learning
							in real-time.
						</p>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/dashboard">
								<Button
									size="lg"
									className="group h-14 cursor-pointer rounded-2xl bg-ab-primary px-10 text-lg font-black text-primary-foreground shadow-xl shadow-ab-primary/25 transition-all active:scale-95 hover:bg-ab-primary/90"
								>
									Abyash
									<ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Features */}
				<section className="border-y border-ab-border/80 py-24">
					<div className="mx-auto max-w-7xl px-6 text-center">
						<h2 className="mb-16 text-3xl font-black uppercase tracking-tight">
							Operational Ecosystem
						</h2>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							{/* Staff Card */}
							<div className="group rounded-[2.5rem] border border-ab-border/80 bg-ab-surface p-10 text-left transition-all duration-300 hover:border-ab-primary/40">
								<div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-ab-primary/10 text-ab-primary transition-all group-hover:bg-ab-primary group-hover:text-white">
									<FileEdit className="size-7" />
								</div>

								<h3 className="mb-4 text-2xl font-black">Staff Administration</h3>

								<p className="mb-8 font-medium leading-relaxed text-ab-text-secondary">
									Empower your teaching by creating custom question banks and assessments tailored
									to your specific batch modules.
								</p>

								<ul className="grid gap-3 text-sm font-bold text-ab-text-primary/80">
									<li className="flex items-center gap-3">
										<Zap className="size-4 text-ab-primary" /> Batch Management
									</li>
									<li className="flex items-center gap-3">
										<Zap className="size-4 text-ab-primary" /> Real-time Result Tracking
									</li>
									<li className="flex items-center gap-3">
										<Zap className="size-4 text-ab-primary" /> Automated Assessment Delivery
									</li>
								</ul>
							</div>

							{/* Student Card */}
							<div className="group rounded-[2.5rem] border border-ab-border/80 bg-ab-surface p-10 text-left transition-all duration-300 hover:border-ab-primary/40">
								<div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-ab-primary/10 text-ab-primary transition-all group-hover:bg-ab-primary group-hover:text-primary-foreground">
									<UserCheck className="size-7" />
								</div>

								<h3 className="mb-4 text-2xl font-black">Student Practice</h3>

								<p className="mb-8 font-medium leading-relaxed text-ab-text-secondary">
									Bridging the gap between theory and practice. Students can attempt tests instantly
									after their classroom sessions.
								</p>

								<ul className="grid gap-3 text-sm font-bold text-ab-text-primary/80">
									<li className="flex items-center gap-3">
										<ShieldCheck className="size-4 text-ab-primary" /> Personalized Test Panels
									</li>
									<li className="flex items-center gap-3">
										<ShieldCheck className="size-4 text-ab-primary" /> Instant Feedback Loop
									</li>
									<li className="flex items-center gap-3">
										<ShieldCheck className="size-4 text-ab-primary" /> Progress Reports
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="mt-auto border-t border-ab-border/80 bg-ab-bg py-12">
					<div className="mx-auto max-w-7xl px-6">
						<div className="flex flex-col items-center justify-between gap-10 md:flex-row">
							<div className="space-y-4 text-center md:text-left">
								<div className="flex items-center justify-center gap-2 md:justify-start">
									<GraduationCap className="size-6 text-ab-primary" />
									<span className="text-xl font-black uppercase tracking-tighter">Abyash</span>
								</div>

								<p className="text-sm font-medium text-ab-text-secondary">
									An internal academic platform powered by <br />
									<span className="font-black text-ab-text-primary">
										Tech Master Computer Institute
									</span>
								</p>
							</div>

							<div className="border-l-0 pl-0 text-center md:border-l md:border-ab-border/80 md:pl-10 md:text-right">
								<p className="mb-3 text-xs font-black uppercase tracking-widest text-ab-primary">
									Campus Address
								</p>
								<p className="text-sm font-bold leading-relaxed text-ab-text-primary/90">
									Tech Master Campus, Near Town Hall,
									<br />
									Operational Resource Center
								</p>
							</div>
						</div>

						<div className="mt-12 border-t border-ab-border/80 pt-8 text-center">
							<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ab-text-secondary">
								© {new Date().getFullYear()} Tech Master Computer Institute. All rights reserved.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</main>
	);
}
