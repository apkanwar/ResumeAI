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
        'artic-blue': '#F0F8FF',
        'eazy-main': {
          25: '#00c1ff80',
          50: '#00c1ff80',
          75: '#00c1ffbf',
          90: '#00c1ffe6',
          100: '#0099FF',
        },
      },
      fontFamily: {
        'headings': ['Rubik', 'sans-serif'],
        'main': ['Montserrat', 'sans-serif'],
        'numbers': ['Onest', 'sans-serif']
      },
      backgroundImage: {
        'gradient-45': 'linear-gradient(45deg, var(--tw-gradient-stops))'
      }
    }
  },
  plugins: [],
})
