// Design tokens shared across the app. Single source of truth so any
// visual change (skeleton tint, date formatting, tone maps) lives here.

// ── Skeleton shimmer (react-loading-skeleton) ─────────────────────
export const SKELETON_BASE      = '#EDE8DF';
export const SKELETON_HIGHLIGHT = '#F4F0EA';

export const SKELETON_PROPS = {
  baseColor:      SKELETON_BASE,
  highlightColor: SKELETON_HIGHLIGHT,
};

// ── Calendar ──────────────────────────────────────────────────────
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ── Avatar tones ──────────────────────────────────────────────────
// Maps a named tone → Tailwind classes used by Avatar.jsx. Keeping the
// map here means other components (pills, badges, status dots) can pick
// up the same palette without re-inventing class strings.
export const AVATAR_TONES = {
  coral:  'bg-coral text-white',
  blue:   'bg-sky-mg text-white',
  purple: 'bg-purple-mg text-white',
  dark:   'bg-ink text-white',
  muted:  'bg-tile-neutral text-ink-muted',
};

// Map a user role to a preferred avatar tone. Consumed by admin listing
// components where every row has a different role.
export const ROLE_AVATAR_TONE = {
  studio:     'blue',
  admin:      'purple',
  instructor: 'coral',
};

// ── "Open To" arrangement pills ──────────────────────────────────
// Shared by SavedInstructorCard, profile preview, search filters.
export const OPEN_TO_TONES = {
  'Direct Hire':     'bg-sky-soft text-sky-mg',
  'Swaps':           'bg-orange-soft text-orange-mg',
  'Energy Exchange': 'bg-mint-tint text-ink',
};
