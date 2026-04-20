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

// Month/year only: "Aug 2026"
export const formatMonthYear = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
};

// Range display: "Aug 2026 – Oct 2026" / "From Aug 2026" / "Until Oct 2026"
export const formatDateRange = (from, to) => {
  const f = formatMonthYear(from);
  const t = formatMonthYear(to);
  if (f && t) return `${f} – ${t}`;
  if (f)      return `From ${f}`;
  if (t)      return `Until ${t}`;
  return '';
};
