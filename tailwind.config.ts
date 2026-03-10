import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: [
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#000000ff',
					light: '#A78BFA',
					dark: '#5B21B6'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					light: '#67E8F9',
					foreground: 'hsl(var(--accent-foreground))'
				},
				surface: {
					DEFAULT: '#ffffffff',
					card: '#1A1A1A',
					border: '#5251519d'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				logo: [
					'var(--font-bebas-neue)',
					'Bebas Neue',
					'sans-serif'
				],
				display: [
					'Syne',
					'var(--font-syne)',
					'system-ui',
					'sans-serif'
				],
				body: [
					'DM Sans',
					'var(--font-dm-sans)',
					'system-ui',
					'sans-serif'
				]
			},
			borderRadius: {
				card: '12px',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.04)',
				'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.10), 0 0 40px -10px rgba(124, 58, 237, 0.15)'
			},
			keyframes: {
				'copy-pulse': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.08)',
						opacity: '0.85'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'copy-pulse': 'copy-pulse 0.3s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
