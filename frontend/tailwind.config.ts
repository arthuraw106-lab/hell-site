import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-persian)', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        display: ['var(--font-persian)', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        hell: {
          void: '#030308',
          voidSoft: '#060612',
          dark: '#030308',
          card: '#0b0b18',
          soft: '#111127',
          panel: '#0b0b18',
          panelSoft: '#15152d',
          line: 'rgba(167,139,250,0.14)',
          lineStrong: 'rgba(167,139,250,0.24)',

          purple: '#4c1d95',
          purple2: '#5b21b6',
          violet: '#7c3aed',
          violet2: '#8b5cf6',
          indigo: '#312e81',

          red: '#ef233c',
          red2: '#ff4d6d',
          gold: '#c4b5fd',
          cyan: '#a78bfa',
          green: '#22c55e',
          muted: '#a1a1aa',
        },
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      boxShadow: {
        glow: '0 0 50px rgba(124,58,237,.34)',
        violet: '0 0 60px rgba(124,58,237,.34)',
        gold: '0 0 45px rgba(167,139,250,.22)',
        card: '0 24px 80px rgba(0,0,0,.45)',
        soft: '0 18px 50px rgba(0,0,0,.34)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'hell-page':
          'radial-gradient(circle at 20% 0%, rgba(76,29,149,.35), transparent 32%), radial-gradient(circle at 80% 10%, rgba(124,58,237,.22), transparent 35%), radial-gradient(circle at 50% 100%, rgba(49,46,129,.20), transparent 35%), #030308',
        'hell-card':
          'linear-gradient(145deg, rgba(124,58,237,.15), rgba(255,255,255,.035))',
        'hell-hero':
          'linear-gradient(135deg, rgba(76,29,149,.55), rgba(124,58,237,.25), rgba(3,3,8,.85))',
        'hell-text':
          'linear-gradient(90deg, #ffffff, #c4b5fd, #8b5cf6, #4c1d95)',
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3.2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        spinSlow: 'spin 12s linear infinite',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 35px rgba(124,58,237,.25)' },
          '50%': { boxShadow: '0 0 85px rgba(124,58,237,.50)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
