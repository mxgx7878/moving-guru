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
        //
        // NOTE on naming: `coral` keeps its name for backwards-compat
        // (`bg-coral`, `text-coral` are used throughout the codebase),
        // but its hex value is now mint green. Rename to `primary` in
        // a future refactor when you have time to find/replace.
        lime: {
          DEFAULT: '#f5fca6',   // pale cream-yellow accent (unchanged — used as soft accent backgrounds)
          dark:    '#87C04E',   // was #ce4f56 (red) — now darker mint, matches the new primary
          soft:    'rgba(157, 217, 100, 0.12)',  // was red rgba — now soft mint tint
        },
        coral: {
          DEFAULT: '#9DD964',   // ← was #CE4F56 — primary brand button colour (mint green)
          hover:   '#87C04E',   // ← was #b8454c — darker mint for hover state
          soft:    'rgba(157, 217, 100, 0.12)',  // ← was red rgba
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

      // ── Gradient backgrounds for portal pages ────────────────────
      // Use as `bg-gradient-dashboard` on PortalLayout's main wrapper.
      backgroundImage: {
        'gradient-dashboard': 'linear-gradient(135deg, #FDFCF8 0%, #FDFCF8 60%, #F0F9E5 100%)',
        'gradient-mint':      'linear-gradient(135deg, #9DD964 0%, #87C04E 100%)',
      },
    },
  },
  plugins: [],
};