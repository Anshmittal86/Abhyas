'use client';

// External (React/Next.js)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Third-party packages
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Internal components
import FormField from '@/components/FormField';

// Utilities
import { handleFormBtnLoading } from '@/utils/form-helper';

const AdminLoginSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters long')
});

type AdminLogin = z.infer<typeof AdminLoginSchema>;

function AdminLogin() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const form = useForm<AdminLogin>({
		resolver: zodResolver(AdminLoginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	// Show toast for validation errors
	useEffect(() => {
		const errors = form.formState.errors;
		if (errors.email?.message) {
			toast.error(errors.email.message);
		}
		if (errors.password?.message) {
			toast.error(errors.password.message);
		}
	}, [form.formState.errors]);

	// Handle Login
	const onSubmit = async (data: AdminLogin) => {
		setLoading(true);
		try {
			const response = await fetch('/api/auth/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: data.email,
					password: data.password
				}),
				credentials: 'include'
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(result.message || 'Login successful!');
				router.push('/dashboard');
			} else {
				toast.error(result.message || 'Invalid credentials, please try again.');
			}
		} catch (error) {
			toast.error('Network error, please try again.');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-bg-main text-amber-50">
			<div className="w-full max-w-md border border-amber-50 p-8 rounded-xl shadow-lg">
				<h1 className="text-center text-xl font-bold mb-6">Login as Admin</h1>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Email Field */}
						<FormField
							control={form.control}
							name="email"
							label="Email*"
							placeholder="Enter your email"
							type="email"
						/>

						{/* Password Field */}
						<FormField
							control={form.control}
							name="password"
							label="Password*"
							placeholder="Enter your password"
							type="password"
						/>

						<Button
							type="submit"
							className="w-full py-2 bg-accent-primary font-medium rounded-md hover:bg-blue-700 transition cursor-pointer"
							disabled={loading}
						>
							{handleFormBtnLoading(loading, 'Login', 'Logging in...')}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}

export default AdminLogin;
