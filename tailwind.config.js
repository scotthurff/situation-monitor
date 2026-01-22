/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				bg: '#0a0a0a',
				surface: '#141414',
				'surface-hover': '#1a1a1a',
				border: '#2a2a2a',
				'border-light': '#3a3a3a',
				'text-primary': '#e8e8e8',
				'text-dim': '#888888',
				'text-muted': '#666666',
				accent: '#ffffff',
				danger: '#ff4444',
				success: '#44ff88',
				warning: '#ffaa00',
				info: '#4488ff',
				// Legacy aliases
				'panel-bg': '#141414',
				'panel-border': '#2a2a2a'
			},
			fontFamily: {
				mono: ["'SF Mono'", 'Monaco', 'Inconsolata', "'Fira Code'", 'monospace']
			},
			fontSize: {
				'2xs': '0.65rem',
				'xs': '0.7rem',
				'sm': '0.75rem',
				'base': '0.8rem',
				'lg': '0.9rem'
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'shimmer': 'shimmer 1.5s infinite'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			}
		}
	},
	plugins: []
};
