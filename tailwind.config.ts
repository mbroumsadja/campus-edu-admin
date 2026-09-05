import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens:{
        "xs":"300px"
      },
      fontFamily: {
        sans:    ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edf5ff',
          100: '#dfeeff',
          200: '#bdd8ff',
          400: '#3b82f6',
          500: '#0b3f8a',
          600: '#082d5c',
          700: '#072750',
          900: '#051d36',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fc',
          100: '#f1f3f8',
          200: '#e4e8f0',
          800: '#1a1d27',
          900: '#111318',
          950: '#0b0d12',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,.10), 0 8px 32px rgba(0,0,0,.06)',
        'brand':  '0 4px 20px rgba(11,63,138,.35)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

export default config
