/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				main: 'var(--color-bg-main)',
				surface: 'var(--color-bg-surface)',
				sidebar: 'var(--color-bg-sidebar)',

				primary: 'var(--color-primary)',
				secondary: 'var(--color-secondary)',
				muted: 'var(--color-muted)',

				accent: 'var(--color-accent-primary)',
				success: 'var(--color-accent-success)',
				warning: 'var(--color-accent-warning)',
				error: 'var(--color-accent-error)',

				border: 'var(--color-border-default)'
			}
		}
	},
	plugins: []
};
