import { STORAGE_URL } from '../constants/apiConstants';

/**
 * Convert Laravel storage path to full URL.
 * - "/storage/profile_pictures/abc.png" → "http://localhost:8000/storage/profile_pictures/abc.png"
 * - "http://..." or "https://..." → returned as-is
 * - null/undefined → returns fallback
 */
export const getImageUrl = (path, fallback = null) => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  return `${STORAGE_URL}${path}`;
};
