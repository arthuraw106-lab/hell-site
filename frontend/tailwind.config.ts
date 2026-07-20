import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-persian)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        hell: {
          bg: '#0a0814',
          card: '#14102a',
          border: '#2a2245',
          purple: '#4c1d95',
          violet: '#7c3aed',
          violet2: '#8b5cf6',
          light: '#a78bfa',
          muted: '#8b7fa8',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;