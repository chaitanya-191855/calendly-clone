/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        calendly: {
          blue:  '#006BFF',
          dark:  '#1A1A2E',
          light: '#F8F9FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}
