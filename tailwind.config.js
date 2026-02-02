/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"General Sans"', 'sans-serif'],   // default font-sans
        general: ['"General Sans"', 'sans-serif'] // custom utility
      },
      colors: {
        primary: '#1F6FEB',
        'primary-50': '#eff6ff',
        'primary-100': '#dbeafe',
        'primary-200': '#bfdbfe',
        'primary-300': '#93c5fd',
        'primary-400': '#60a5fa',
        'primary-500': '#1F6FEB',
        'primary-600': '#1d4ed8',
        'primary-700': '#1e40af',
        'primary-800': '#1e3a8a',
        'primary-900': '#1e3a8a',
        'custom-dark': '#111827',
      },
      boxShadow: {
        'custom-1': '0px 0px 1px 0px #7D7D7D1A',
        'custom-2': '0px 1px 1px 0px #7D7D7D17',
        'custom-3': '0px 3px 2px 0px #7D7D7D0D',
        'custom-4': '0px 5px 2px 0px #7D7D7D03',
        'custom-5': '0px 7px 2px 0px #7D7D7D00',
        'custom': '0px 0px 1px 0px #7D7D7D1A, 0px 1px 1px 0px #7D7D7D17, 0px 3px 2px 0px #7D7D7D0D, 0px 5px 2px 0px #7D7D7D03, 0px 7px 2px 0px #7D7D7D00',
      }
    },
  },
  plugins: [],
}
