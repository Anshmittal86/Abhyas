import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/ui/FormField';
import { handleFormBtnLoading } from '@/components/common/HandleFormLoading';
import { GraduationCap, Shield, UserCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const StudentLoginSchema = z.object({
	provisionalNo: z.string().min(3, 'Provisional No must be at least 3 characters long'),
	password: z.string().min(6, 'Password must be at least 6 characters long')
});

type StudentLoginInner = z.infer<typeof StudentLoginSchema>;

const LoginContent = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const provisionalFromUrl = searchParams.get('provisionalNo');

	const form = useForm<StudentLoginInner>({
		resolver: zodResolver(StudentLoginSchema),
		defaultValues: { provisionalNo: '', password: '' }
	});

	useEffect(() => {
		if (provisionalFromUrl) form.setValue('provisionalNo', provisionalFromUrl);
	}, [provisionalFromUrl, form]);

	const onSubmit = async (data: StudentLoginInner) => {
		setLoading(true);
		try {
			const response = await fetch('/api/auth/student/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				credentials: 'include'
			});
			const result = await response.json();
			if (response.ok && result.success) {
				toast.success('Welcome back to Abyash!');
				router.push('/dashboard');
			} else {
				toast.error(result.message || 'Invalid credentials');
			}
		} catch {
			toast.error('Network error, please try again.');
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

			<div className="z-10 w-full max-w-110 animate-in fade-in zoom-in duration-500">
				<div className="relative rounded-[2.5rem] border border-ab-border bg-ab-surface p-10 shadow-2xl">
					{/* Header */}
					<div className="mb-10 flex flex-col items-center text-center">
						<div className="mb-5 rounded-2xl bg-ab-primary p-3 shadow-lg shadow-ab-primary/25">
							<GraduationCap className="size-8 text-primary-foreground" />
						</div>
						<h1 className="mb-2 text-3xl font-black tracking-tight text-ab-text-primary">
							Student Login
						</h1>
						<p className="text-sm font-medium text-ab-text-secondary">
							Access your Abyash dashboard
						</p>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="space-y-4">
								<div className="group relative">
									<FormField
										control={form.control}
										name="provisionalNo"
										label="Provisional ID"
										placeholder="e.g. ST-101"
									/>
									<UserCircle className="absolute right-4 top-9.5 size-5 text-ab-text-secondary transition-colors group-focus-within:text-ab-primary" />
								</div>

								<div className="group relative">
									<FormField
										control={form.control}
										name="password"
										label="Secret Password"
										placeholder="••••••••"
										type="password"
									/>
									<Shield className="absolute right-4 top-9.5 size-5 text-ab-text-secondary transition-colors group-focus-within:text-ab-primary" />
								</div>
							</div>

							<div className="pt-2">
								<Button
									type="submit"
									disabled={loading}
									className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ab-primary text-lg font-black text-primary-foreground shadow-xl shadow-ab-primary/25 transition-all active:scale-95 hover:bg-ab-primary/90"
								>
									{handleFormBtnLoading(loading, 'Sign In to Portal', 'Authenticating...')}
								</Button>
							</div>
						</form>
					</Form>

					<div className="mt-8 border-t border-ab-border/80 pt-6 text-center">
						<p className="text-[11px] font-bold uppercase tracking-widest text-ab-text-secondary">
							Forgotten your ID? Contact your Branch Admin
						</p>
					</div>
				</div>

				<p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-ab-text-secondary">
					Powered by Tech Master Computer Institute
				</p>
			</div>
		</div>
	);
};

export default LoginContent;
