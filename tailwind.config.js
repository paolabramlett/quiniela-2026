/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
      },
      colors: {
        primary: '#E8351E',
        accent:  '#00C4A7',
        gold:    '#F5C400',
        danger:  '#E8351E',
        success: '#22C55E',
        bg:      '#080808',
        card:    '#111111',
        surface: '#1A1A1A',
        line:    '#272727',
      },
    },
  },
  plugins: [],
}
