// src/lib/apiFetch.ts

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
	// 1️⃣ First attempt
	let response = await fetch(input, {
		...init,
		credentials: 'include'
	});

	/* Handle "Student Not Found" (404 + specific message) */
	if (response.status === 404) {
		try {
			const data = await response.clone().json(); // clone so we don't consume body

			const message = (data?.message || data?.error || '').toLowerCase();

			if (
				message.includes('student not found') ||
				message.includes('student does not exist') ||
				message.includes('account not found') ||
				message.includes('user not found')
			) {
				console.warn('🚨 Student/account not found → Force logout');

				// Show toast immediately
				import('sonner').then(({ toast }) => {
					toast.error('Your account no longer exists. Logging you out...', {
						duration: 6000
					});
				});

				// Call logout API (clears cookies/server-side)
				await fetch('/api/auth/logout', {
					method: 'POST',
					credentials: 'include'
				});

				// Hard redirect to login (clears any client-side state)
				window.location.href = '/login?reason=account-not-found';

				// Return early to prevent further execution
				return response;
			}
		} catch (e) {
			// JSON parse failed → ignore and continue normal flow
		}
	}

	// ==================== Existing 401 Refresh Logic ====================
	if (response.status === 401) {
		try {
			const refreshResponse = await fetch('/api/auth/refresh', {
				method: 'POST',
				credentials: 'include'
			});

			if (!refreshResponse.ok) {
				throw new Error('AUTH_EXPIRED');
			}

			// Retry original request after successful refresh
			response = await fetch(input, {
				...init,
				credentials: 'include'
			});
		} catch (err) {
			// Refresh failed → force logout
			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});

			window.location.href = '/login?reason=session-expired';
			throw err;
		}
	}

	return response;
}
