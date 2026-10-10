/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        garage: {
          50:'#f5f7f9',100:'#e9eef2',200:'#cfdae2',300:'#a8bdca',400:'#7b9bad',
          500:'#5a8296',600:'#456877',700:'#375360',800:'#2c424d',900:'#1c2b33',
          950:'#0b0f14'
        },
        accent: {
          400:'#38bdf8',500:'#0ea5e9',600:'#0284c7'
        }
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','Segoe UI','sans-serif']
      }
    }
  },
  plugins: []
}
