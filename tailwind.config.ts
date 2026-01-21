/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'bg-main': 'var(--color-bg-main)',
				'bg-surface': 'var(--color-bg-surface)',
				'bg-sidebar': 'var(--color-bg-sidebar)',
				'border-default': 'var(--color-border-default)',
				'text-primary': 'var(--color-primary)',
				'text-secondary': 'var(--color-secondary)',
				'text-muted': 'var(--color-muted)',
				'accent-primary': 'var(--color-accent-primary)',
				'accent-success': 'var(--color-accent-success)',
				'accent-warning': 'var(--color-accent-warning)',
				'accent-error': 'var(--color-accent-error)'
			},
			backgroundColor: {
				main: 'var(--color-bg-main)',
				surface: 'var(--color-bg-surface)',
				sidebar: 'var(--color-bg-sidebar)'
			},
			borderColor: {
				default: 'var(--color-border-default)'
			},
			textColor: {
				primary: 'var(--color-primary)',
				secondary: 'var(--color-secondary)',
				muted: 'var(--color-muted)',
				accent: 'var(--color-accent-primary)',
				success: 'var(--color-accent-success)',
				warning: 'var(--color-accent-warning)',
				error: 'var(--color-accent-error)'
			}
		}
	},
	plugins: []
};
