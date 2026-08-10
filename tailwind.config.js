import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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

         danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    DEFAULT: "#ef4444",
  },

        orange: {
          ...YELLOW,
          mg:   '#7E811F',
          soft: 'rgba(245, 253, 166, 0.50)',
        },
        amber:  YELLOW,
        yellow: YELLOW,

        red: {
  50: "#fef2f2",
  100: "#fee2e2",
  200: "#fecaca",
  300: "#fca5a5",
  400: "#f87171",
  500: "#ef4444",
  600: "#dc2626",
  700: "#b91c1c",
  800: "#991b1b",
  900: "#7f1d1d",
  DEFAULT: "#ef4444",
},
        rose: INK,
        pink: INK,

        sand: { DEFAULT: '#FFFFFF' },
        warm: { bg: '#FFFFFF' },
        cream: {
          DEFAULT: '#FAFEE0',
          soft:    '#FFFEF5',
          tint:    '#FFFEF7',
        },

        ink: {
          DEFAULT: '#1A1A1A',
          muted:   '#6B6B66',
          soft:    '#9A9A94',
          faint:   '#C4BCB4',
        },
        edge: {
          DEFAULT: '#E5E0D8',
          soft:    '#F0EBE3',
        },
        tile: {
          neutral: '#F5F0E8',
        },
      },

      backgroundImage: {
        'gradient-dashboard': 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 60%, #F6FFE9 100%)',
        'gradient-mint':      'linear-gradient(135deg, #B4FF5A 0%, #9BE63D 100%)',
      },
    },
  },
  plugins: [],
};
