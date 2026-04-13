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
        chartreuse: {
          DEFAULT: '#CCFF00',  // bright neon lime — matches client palette swatch
          dark:    '#B8E600',  // hover / pressed
          soft:    '#E6FF80',  // tinted background
        },
        mint: {
          DEFAULT: '#9DD964',  // sharper light green per palette swatch
          soft:    '#6BE6A4',  // legacy mint kept for status pills
        },
        sand: {
          DEFAULT: '#EDE8DF',
        },
        warm: {
          bg: '#FDFCF8',
        },
        // ── Brand-aligned soft yellow used as the primary background tint
        //    (replaces previous grey/sand backgrounds across the portal).
        cream: {
          DEFAULT: '#FBF8E4',  // page background
          soft:    '#FDFBEF',  // even softer for nested cards/sections
          tint:    '#FEFCF1',  // text-box / input background
        },
      },
    },
  },
  plugins: [],
};
