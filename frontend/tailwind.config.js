/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dargold: {
          50: '#FBF8EF',
          100: '#F5EED8',
          200: '#EBDBAF',
          300: '#DFC784',
          400: '#D4AF37', // DarGlobal Gold
          500: '#C5A028',
          600: '#A4821E',
          700: '#7E6217',
          800: '#5A4413',
          900: '#3D2E0E',
        },
        navy: {
          800: '#151D2A',
          850: '#101722',
          900: '#0B1119',
          950: '#070A0F',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
