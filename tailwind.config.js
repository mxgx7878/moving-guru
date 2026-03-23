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
          DEFAULT: '#d4f53c',
          dark: '#8fa020',
        },
        orange: {
          mg: '#e8834a',
        },
      },
    },
  },
  plugins: [],
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
