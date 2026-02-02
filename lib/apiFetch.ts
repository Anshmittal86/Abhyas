// src/lib/apiFetch.ts

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
	// 1️⃣ First attempt (normal API call)
	let response = await fetch(input, {
		...init,
		credentials: 'include' // 🔑 cookies always included
	});

	// 2️⃣ If access token expired
	if (response.status === 401) {
		// 🔄 Try refresh token
		const refreshResponse = await fetch('/api/auth/refresh', {
			method: 'POST',
			credentials: 'include'
		});

		// ❌ Refresh failed → force logout
		if (!refreshResponse.ok) {
			throw new Error('AUTH_EXPIRED');
		}

		// 🔁 Retry original request after refresh
		response = await fetch(input, {
			...init,
			credentials: 'include'
		});
	}

	return response;
}
