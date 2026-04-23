import { MONTHS_SHORT } from '../constants/theme';

// Compact date style: "Jul 24, 2026"
export const formatShortDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return '';
  }
};

// Month/year only: "Aug 2026". Accepts either an ISO date string or a
// YYYY-MM value (from a month-picker input). The latter is parsed by
// hand because Safari refuses to parse YYYY-MM as a Date.
export const formatMonthYear = (value) => {
  if (!value) return '';

  // Month-only inputs come back as "2026-08" — parse manually.
  const match = /^(\d{4})-(\d{1,2})(?:$|-)/.exec(String(value));
  if (match) {
    const month = MONTHS_SHORT[parseInt(match[2], 10) - 1];
    return month ? `${month} ${match[1]}` : '';
  }

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
};

// Range display: "Aug 2026 – Oct 2026" / "From Aug 2026" / "Until Oct 2026".
// Works for both ISO dates and YYYY-MM values — single formatter used
// everywhere (register wizard, profile pages, card meta rows).
export const formatDateRange = (from, to) => {
  const f = formatMonthYear(from);
  const t = formatMonthYear(to);
  if (f && t) return `${f} – ${t}`;
  if (f)      return `From ${f}`;
  if (t)      return `Until ${t}`;
  return '';
};

// Short relative time: "just now" / "5m ago" / "3h ago" / "2d ago".
// Anything older than a week falls back to formatShortDate.
export const formatRelative = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60)         return 'just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400)  return `${Math.floor(diff / 86400)}d ago`;
  return formatShortDate(iso);
};
