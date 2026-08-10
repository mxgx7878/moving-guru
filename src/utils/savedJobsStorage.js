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
  }
};

export const toggleSavedJob = (ids, id) => (
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
);
