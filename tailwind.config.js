import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'unbounded': ['Unbounded', 'cursive'],
        'dm': ['DM Sans', 'sans-serif'],
      },
      colors: {
        lime: {
          DEFAULT: '#f5fca6',
          dark: '#ce4f56',
          soft: 'rgba(206, 79, 86, 0.08)',
        },
        coral: {
          DEFAULT: '#CE4F56',
        },
        orange: {
          mg: '#E89560',
        },
        sky: {
          mg: '#2DA4D6',
        },
        mint: {
          DEFAULT: '#6BE6A4',
        },
        sand: {
          DEFAULT: '#EDE8DF',
        },
        warm: {
          bg: '#FDFCF8',
        },
      },
    },
  },
  plugins: [],
};
