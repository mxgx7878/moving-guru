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
        'dm':        ['DM Sans', 'sans-serif'],
      },
      colors: {
        // ── Brand accents ────────────────────────────────────────────
        lime: {
          DEFAULT: '#f5fca6',
          dark:    '#ce4f56',
          soft:    'rgba(206, 79, 86, 0.08)',
        },
        coral: {
          DEFAULT: '#CE4F56',
          hover:   '#b8454c',
          soft:    'rgba(206, 79, 86, 0.10)',
        },
        orange: {
          mg:   '#E89560',
          soft: 'rgba(232, 149, 96, 0.15)',
        },
        sky: {
          mg:    '#2DA4D6',
          hover: '#2590bd',
          soft:  'rgba(45, 164, 214, 0.10)',
        },
        chartreuse: {
          DEFAULT: '#CCFF00',
          dark:    '#B8E600',
          soft:    '#E6FF80',
        },
        mint: {
          DEFAULT: '#9DD964',
          soft:    '#6BE6A4',
          tint:    'rgba(107, 230, 164, 0.20)',
        },
        purple: {
          mg:    '#7F77DD',
          hover: '#534AB7',
        },
        sand: {
          DEFAULT: '#EDE8DF',
        },
        warm: {
          bg: '#FDFCF8',
        },
        cream: {
          DEFAULT: '#FBF8E4',
          soft:    '#FDFBEF',
          tint:    '#FEFCF1',
        },

        // ── Semantic ink / borders ──────────────────────────────────
        //   Prefer these over raw hex so a palette change is one file.
        ink: {
          DEFAULT: '#3E3D38',   // primary body text
          muted:   '#6B6B66',   // secondary text
          soft:    '#9A9A94',   // tertiary
          faint:   '#C4BCB4',   // placeholder
        },
        edge: {
          DEFAULT: '#E5E0D8',   // default border
          soft:    '#F0EBE3',   // table dividers
        },
        tile: {
          neutral: '#F5F0E8',   // avatar image fallback tile
        },
      },
    },
  },
  plugins: [],
};
