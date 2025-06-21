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
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          darker: '#B45309',
          light: '#FCD34D',
          lighter: '#FEF3C7',
        },
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
        dark: {
          primary: '#0F0F0F',
          secondary: '#1A1A1A',
          accent: '#2A2A2A',
          surface: '#1F1F1F',
          text: '#FFFFFF',
          textSecondary: '#E5E5E5',
          muted: '#A0A0A0',
          border: '#404040',
          borderLight: '#2A2A2A',
          highlight: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
} 