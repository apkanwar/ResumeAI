/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dm-black': '#252525',
        'midnight': '#1B1C1E',
        'slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'rose': {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        'artic-blue': '#F0F8FF',
        'eazy-main': {
          25: '#00c1ff80',
          50: '#00c1ff80',
          75: '#00c1ffbf',
          90: '#00c1ffe6',
          100: '#0099FF',
        },
        'saphire': '#2B50AA',
        'plum': '#8740b2',
        'top-orange': '#FF9966'
      },
      fontFamily: {
        'headings': ['Rubik', 'sans-serif'],
        'main': ['Montserrat', 'sans-serif'],
        'numbers': ['Onest', 'sans-serif']
      },
      backgroundImage: {
        'gradient-45': 'linear-gradient(45deg, var(--tw-gradient-stops))',
        'gradient-orange': 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
        'google': 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
      }
    }
  },
  plugins: [],
})
