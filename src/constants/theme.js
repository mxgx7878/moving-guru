// Design tokens shared across the app. Single source of truth so any
// visual change (skeleton tint, date formatting, brand accents) lives
// in one place.

// ── Skeleton shimmer (react-loading-skeleton) ─────────────────────
// Passed as baseColor / highlightColor to every <Skeleton> in the app.
export const SKELETON_BASE      = '#EDE8DF';
export const SKELETON_HIGHLIGHT = '#F4F0EA';

// Prop bundle — spread onto any <Skeleton> to pick up both colours at once:
//   <Skeleton width={120} height={12} {...SKELETON_PROPS} />
export const SKELETON_PROPS = {
  baseColor:      SKELETON_BASE,
  highlightColor: SKELETON_HIGHLIGHT,
};

// ── Calendar ──────────────────────────────────────────────────────
// Abbreviated month names — used by formatDateRange etc. for month-only
// YYYY-MM inputs where Date.parse behaviour differs across browsers.
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
