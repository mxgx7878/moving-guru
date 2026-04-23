// Social links come from the API as an array of single-key objects, e.g.
//   [{ instagram: "https://..." }, { linkedin: "https://..." }]
// Older code paths sometimes pass a flat object, so handle both shapes.
export const SOCIAL_PLATFORM_ORDER = [
  'instagram',
  'facebook',
  'twitter',
  'tiktok',
  'youtube',
  'linkedin',
];

export const SOCIAL_PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook:  'Facebook',
  twitter:   'X / Twitter',
  tiktok:    'TikTok',
  youtube:   'YouTube',
  linkedin:  'LinkedIn',
};

export function normalizeSocialLinks(input) {
  const out = {};
  if (!input) return out;

  if (Array.isArray(input)) {
    input.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      Object.entries(entry).forEach(([key, val]) => {
        if (val) out[key] = val;
      });
    });
    return out;
  }

  if (typeof input === 'object') {
    Object.entries(input).forEach(([key, val]) => {
      if (val) out[key] = val;
    });
  }
  return out;
}

export function resolveSocialUrl(platform, value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const cleaned = value.replace(/^@/, '').replace(/^\//, '');
  switch (platform) {
    case 'instagram': return `https://instagram.com/${cleaned}`;
    case 'facebook':  return `https://facebook.com/${cleaned}`;
    case 'twitter':   return `https://x.com/${cleaned}`;
    case 'tiktok':    return `https://tiktok.com/@${cleaned}`;
    case 'youtube':   return `https://youtube.com/${cleaned}`;
    case 'linkedin':  return `https://linkedin.com/in/${cleaned}`;
    default:          return value;
  }
}
