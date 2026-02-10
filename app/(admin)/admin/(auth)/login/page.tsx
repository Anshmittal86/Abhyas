'use client';
// ✅ Working
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/ui/FormField';
import { handleFormBtnLoading } from '@/components/common/HandleFormLoading';
import { Lock, Mail, ShieldCheck, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

const AdminLoginSchema = z.object({
	email: z.email('Invalid email address').min(5, 'Email is too short'),
	password: z.string().min(6, 'Password must be at least 6 characters long')
});

type AdminLoginInner = z.infer<typeof AdminLoginSchema>;

export default function AdminLoginInner() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<AdminLoginInner>({
		resolver: zodResolver(AdminLoginSchema),
		defaultValues: { email: '', password: '' }
	});

	const onSubmit = async (data: AdminLoginInner) => {
		setLoading(true);
		try {
			const response = await fetch('/api/auth/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				credentials: 'include'
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('Admin authenticated successfully!');
				router.push('/admin/dashboard');
			} else {
				toast.error(result.message || 'Access denied. Invalid admin credentials');
			}
		} catch {
			toast.error('Connection error. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ab-bg p-6">
			{/* Decorative glows */}
			<div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-ab-primary/10 blur-[120px]" />
			<div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-ab-primary/5 blur-[120px]" />

			{/* Back link */}
			<div className="absolute left-8 top-8 z-20">
				<Link
					href="/"
					className="group inline-flex items-center rounded-lg border border-ab-border/80 bg-ab-surface px-4 py-2 text-sm font-bold text-ab-text-secondary transition-colors hover:text-ab-text-primary"
				>
					<ArrowLeft className="mr-2 size-4 text-ab-primary transition-transform group-hover:-translate-x-1" />
					Back to Website
				</Link>
			</div>

			<div className="z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="relative overflow-hidden rounded-[2.5rem] border border-ab-border bg-ab-surface p-10 shadow-2xl">
					{/* Admin watermark */}
					<div className="absolute right-0 top-0 p-6 opacity-[0.03]">
						<ShieldCheck className="size-32 rotate-12 text-ab-primary" />
					</div>

					{/* Header */}
					<div className="mb-10 flex flex-col items-center text-center">
						<div className="mb-5 rounded-2xl border border-ab-border/80 bg-ab-primary/10 p-3 shadow-lg">
							<LayoutDashboard className="size-8 text-ab-primary" />
						</div>
						<h1 className="mb-2 text-3xl font-black tracking-tight text-ab-text-primary">
							Admin Portal
						</h1>
						<p className="text-sm font-medium text-ab-text-secondary">
							Management & Control Center
						</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="space-y-4">
								<div className="group relative">
									<FormField
										control={form.control}
										name="email"
										label="Admin Email"
										placeholder="admin@abyash.com"
										type="email"
									/>
									<Mail className="absolute right-4 top-[38px] size-5 text-ab-text-secondary transition-colors group-focus-within:text-ab-primary" />
								</div>

								<div className="group relative">
									<FormField
										control={form.control}
										name="password"
										label="Master Password"
										placeholder="••••••••"
										type="password"
									/>
									<Lock className="absolute right-4 top-[38px] size-5 text-ab-text-secondary transition-colors group-focus-within:text-ab-primary" />
								</div>
							</div>

							<div className="pt-2">
								<Button
									type="submit"
									disabled={loading}
									className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ab-primary text-lg font-black text-primary-foreground shadow-xl transition-all active:scale-95 hover:bg-ab-primary/90"
								>
									{handleFormBtnLoading(loading, 'Secure Login', 'Authorizing Access...')}
								</Button>
							</div>
						</form>
					</Form>

					{/* Footer */}
					<div className="mt-8 border-t border-ab-border/80 pt-6 text-center">
						<div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ab-text-secondary">
							<ShieldCheck className="size-3 text-ab-green-text" />
							<span>End-to-End Encrypted Session</span>
						</div>
					</div>
				</div>

				<p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-ab-text-secondary">
					Internal Use Only • Abyash v2.0
				</p>
			</div>
		</div>
	);
}
