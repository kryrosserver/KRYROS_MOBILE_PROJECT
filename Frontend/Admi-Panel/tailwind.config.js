/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#12D6C5',
          dark: '#0B1320',
          surface: '#111827',
          secondary: '#182131',
          glow: '#1DE9D3',
          hover: '#10C4B5',
          card: '#151E2D',
          'border-dark': '#2B3648',
          'text-muted': '#AAB4C5',
        },
        primary: {
          50: '#f0fdfc',
          100: '#ccfbf5',
          200: '#99f6eb',
          300: '#5eead8',
          400: '#2dd4c0',
          500: '#12D6C5',
          600: '#10C4B5',
          700: '#0e9e91',
          800: '#107a72',
          900: '#10635d',
        },
        success: '#16C784',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'card': '22px',
        'btn': '14px',
        'input': '14px',
      },
      boxShadow: {
        'card-light': '0 10px 35px rgba(15,23,42,0.06)',
        'card-dark': '0 12px 40px rgba(0,0,0,0.35)',
        'brand': '0 10px 25px rgba(18,214,197,0.25)',
        'brand-focus': '0 0 0 4px rgba(18,214,197,0.15)',
      },
    },
  },
  plugins: [],
}
