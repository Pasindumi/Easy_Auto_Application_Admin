/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',     // Blue 500
        secondary: '#1E3A8A',   // Blue 900
        'admin-bg': '#F0F9FF',  // Sky 50
        'admin-border': '#DBEAFE', // Blue 100
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
