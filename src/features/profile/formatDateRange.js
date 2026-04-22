// Formats a YYYY-MM / YYYY-MM-DD date range to a "Jan 2026 – Feb 2026"
// display string. Used by the instructor profile and the register form —
// previously duplicated in both files.
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (d) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
};

export const formatDateRange = (from, to) => {
  if (!from && !to) return '';
  if (from && to)   return `${fmt(from)} – ${fmt(to)}`;
  if (from)         return `From ${fmt(from)}`;
  return `Until ${fmt(to)}`;
};
