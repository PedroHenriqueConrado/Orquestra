/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#96874B',
          dark: '#413E36',
          darker: '#333129',
          light: '#EBC428',
          lighter: '#FAD956',
        },
        gray: {
          900: '#413E36',
          800: '#333129',
          700: '#504B42',
          600: '#625E55',
          500: '#7A7568',
          400: '#96874B',
          300: '#B0A578',
          200: '#EBC428',
          100: '#FAD956',
          50: '#FBE889',
        },
        dark: {
          primary: '#121212',
          secondary: '#1E1E1E',
          accent: '#2C2C2C',
          text: '#E0E0E0',
          muted: '#888888',
          border: '#333333',
          highlight: '#FAD956',
        },
      },
    },
  },
  plugins: [],
} 