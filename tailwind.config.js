/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#1253ED',
        danger: '#ef233c',
        bg: '#f0f4ff',
      },
    },
  },
  plugins: [],
}
