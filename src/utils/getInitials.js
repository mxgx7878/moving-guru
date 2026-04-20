// "Jane Doe" → "JD". Falls back to a single "?" if the input is empty.
export const getInitials = (name, max = 2) => {
  if (!name) return '?';
  return String(name)
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, max)
    .toUpperCase();
};
