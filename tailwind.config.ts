import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	// Optimizaciones para rendimiento en dispositivos de bajos recursos
	corePlugins: {
		// Deshabilitar plugins que pueden afectar el rendimiento
		container: false,
		// Mantener solo las animaciones esenciales
		animation: true,
		transitionProperty: true,
		transform: true,
	},
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				priority: {
					low: 'hsl(var(--priority-low))',
					medium: 'hsl(var(--priority-medium))',
					high: 'hsl(var(--priority-high))',
					critical: 'hsl(var(--priority-critical))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			// Animaciones optimizadas para rendimiento
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Animaciones simplificadas para mejor rendimiento
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.98)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.15s ease-out',
				'accordion-up': 'accordion-up 0.15s ease-out',
				'fade-in': 'fade-in 0.2s ease-out',
				'scale-in': 'scale-in 0.15s ease-out',
				'slide-up': 'slide-up 0.2s ease-out'
			},
			// Optimizaciones de transiciones
			transitionDuration: {
				'fast': '100ms',
				'normal': '200ms',
				'slow': '300ms'
			},
			transitionTimingFunction: {
				'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
				'ease-in': 'cubic-bezier(0.4, 0, 1, 1)'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate")
	],
	// Configuración para purging más agresivo en producción
	...(process.env.NODE_ENV === 'production' && {
		safelist: [],
		content: [
			"./src/**/*.{ts,tsx}",
			"./index.html"
		]
	})
} satisfies Config;
