/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172338',
        canvas: '#F4F6FA',
        brand: {
          50: '#EEF6FF',
          100: '#DCEBFF',
          200: '#BCD9FF',
          300: '#8ABEFF',
          500: '#3478F6',
          600: '#2563E9',
          700: '#1E4FC2',
          800: '#1D4489',
          900: '#1C3B6D',
          950: '#102749'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(26, 39, 64, 0.08)',
        panel: '0 8px 30px rgba(28, 59, 109, 0.08)',
        floating: '0 14px 35px rgba(25, 49, 84, 0.20)'
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        'toast-in': 'toast-in 180ms ease-out'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
