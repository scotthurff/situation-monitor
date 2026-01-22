/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'panel-bg': '#1a1a2e',
				'panel-border': '#2d2d44',
				'accent': '#00d4ff',
				'accent-dim': '#00a8cc',
				'danger': '#ff4757',
				'warning': '#ffa502',
				'success': '#2ed573',
				'muted': '#747d8c'
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'Fira Code', 'monospace']
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fadeIn 0.3s ease-in-out'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				}
			}
		}
	},
	plugins: []
};
