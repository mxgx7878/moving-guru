// Saved jobs are kept in localStorage under a single per-user key so the
// bookmark state survives reloads without requiring a backend endpoint.
const KEY = 'mg.savedJobs';

export const loadSavedJobs = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSavedJobs = (ids) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // swallow: storage full or disabled
  }
};

export const toggleSavedJob = (ids, id) => (
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
);
