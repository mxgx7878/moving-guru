import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/* ────────────────────────────────────────────────────────────────
   MOVING GURU — brand palette
   ----------------------------------------------------------------
   The whole site runs on FOUR colours only:

     • Green   #B4FF5A   — primary brand / buttons / fills
     • Yellow  #F5FDA6   — secondary / "differentiate" buttons / accents
     • Black   (#1A1A1A) — text only (never a background)
     • White   #FFFFFF   — backgrounds + boxes

   Neutral greys (ink/edge) remain for secondary text + borders.

   To keep the hundreds of existing utility classes working without
   touching every file, the old default Tailwind colour families
   (blue, red, purple, orange, …) are REMAPPED here onto the brand
   palette:
     – cool/accent hues (blue, sky, indigo, violet, teal, cyan,
       emerald, purple, fuchsia, green, lime)  → GREEN ramp
     – warm hues (orange, amber, yellow)                → YELLOW ramp
     – red / rose / pink (errors, destructive)          → INK ramp
       (renders as neutral black/grey text — no red on the site)
   ──────────────────────────────────────────────────────────────── */

// ── Green ramp (brand green #B4FF5A at 400) ─────────────────────
const GREEN = {
  50:  '#F6FFE9',
  100: '#ECFFD2',
  200: '#DBFFA9',
  300: '#C8FF80',
  400: '#B4FF5A',
  500: '#9BE63D',
  600: '#82CC28',
  700: '#5F9220',
  800: '#3D5E16',
  900: '#1F2F0B',
  950: '#0F1705',
  DEFAULT: '#B4FF5A',
};

// ── Yellow ramp (brand yellow #F5FDA6 at 200) ───────────────────
const YELLOW = {
  50:  '#FFFFF0',
  100: '#FDFDD9',
  200: '#F5FDA6',
  300: '#ECF77A',
  400: '#DFE84F',
  500: '#CDD62F',
  600: '#A8AE26',
  700: '#7E811F',
  800: '#545517',
  900: '#2E2E0C',
  950: '#181806',
  DEFAULT: '#F5FDA6',
};

// ── Ink ramp (neutral → black). Used for the old red/rose/pink so
//    error + destructive UI renders as legible black/grey, no red. ─
const INK = {
  50:  '#FAFAFA',
  100: '#F4F4F4',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#525252',
  600: '#333333',
  700: '#262626',
  800: '#171717',
  900: '#0A0A0A',
  950: '#000000',
  DEFAULT: '#333333',
};

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
        // ── Brand accents (named families used throughout) ──────────
        // `coral` / `mint` / `chartreuse` are all green now; `lime`
        // is yellow. Kept under their old names for backwards-compat.
        lime: {
          ...YELLOW,
          DEFAULT: '#F5FDA6',
          dark:    '#A8AE26',
          soft:    'rgba(245, 253, 166, 0.40)',
        },
        coral: {
          DEFAULT: '#B4FF5A',
          hover:   '#9BE63D',
          soft:    'rgba(180, 255, 90, 0.12)',
        },
        chartreuse: {
          DEFAULT: '#B4FF5A',
          dark:    '#9BE63D',
          soft:    '#DBFFA9',
        },
        mint: {
          DEFAULT: '#B4FF5A',
          soft:    '#C8FF80',
          tint:    'rgba(180, 255, 90, 0.20)',
        },

        // ── Remapped default families ───────────────────────────────
        // Cool / accent hues → green.  `sky` and `purple` also keep
        // their custom .mg/.hover/.soft keys used in a few spots.
        blue:     GREEN,
        indigo:   GREEN,
        violet:   GREEN,
        fuchsia:  GREEN,
        teal:     GREEN,
        cyan:     GREEN,
        emerald:  GREEN,
        green:    GREEN,
        sky: {
          ...GREEN,
          mg:    '#5F9220',
          hover: '#4E7A1B',
          soft:  'rgba(180, 255, 90, 0.10)',
        },
        purple: {
          ...GREEN,
          mg:    '#5F9220',
          hover: '#4E7A1B',
        },

        // Warm hues → yellow.
        orange: {
          ...YELLOW,
          mg:   '#7E811F',
          soft: 'rgba(245, 253, 166, 0.50)',
        },
        amber:  YELLOW,
        yellow: YELLOW,

        // Errors / destructive → neutral ink (no red on the site).
        red:  INK,
        rose: INK,
        pink: INK,

        // ── Neutral surfaces (white-ish) ────────────────────────────
        sand: { DEFAULT: '#FFFFFF' },
        warm: { bg: '#FFFFFF' },
        cream: {
          DEFAULT: '#FAFEE0',
          soft:    '#FFFEF5',
          tint:    '#FFFEF7',
        },

        // ── Semantic ink / borders ──────────────────────────────────
        ink: {
          DEFAULT: '#1A1A1A',   // primary body text (black)
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
      // Default portal pages are WHITE. (Find Work & Grow override to
      // a solid green background in their own components.)
      backgroundImage: {
        'gradient-dashboard': 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 60%, #F6FFE9 100%)',
        'gradient-mint':      'linear-gradient(135deg, #B4FF5A 0%, #9BE63D 100%)',
      },
    },
  },
  plugins: [],
};
