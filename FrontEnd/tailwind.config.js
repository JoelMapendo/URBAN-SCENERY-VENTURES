/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './seller.html', './src/**/*.js'],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      maxWidth: {
        'screen-1920': '1760px',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand color — Vibrant Magenta / Pink from Logo ("URBAN")
        brand: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F43F9E',
          500: '#E6007E', // Exact logo magenta pink
          600: '#D10072',
          700: '#A8005C',
          800: '#830048',
          900: '#50002C',
          950: '#31001B',
        },
        // Secondary accent — Bright Golden Yellow from Logo ("SCENERY")
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFB800', // Exact logo golden yellow
          600: '#E5A500',
          700: '#B28000',
          800: '#805C00',
          900: '#4D3700',
        },
        urban: {
          pink: '#E6007E',
          yellow: '#FFB800',
          dark: '#0B0F19',
          darker: '#070A12',
          cardDark: '#111827',
        },
      },
      keyframes: {
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.45)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        bump: 'bump 0.45s ease-out',
        'fade-up': 'fade-up 0.7s ease-out both',
        float: 'float 6s ease-in-out infinite',
        pop: 'pop 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
