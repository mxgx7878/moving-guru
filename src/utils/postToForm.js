// Normalize a Grow post coming from the API (snake_case, mixed field names)
// into the shape the create/edit form expects. Both the instructor GrowPostForm
// and AdminPosts.jsx share this adapter.
export const postToGrowForm = (p) => ({
  type:         p?.type         || 'training',
  title:        p?.title        || '',
  subtitle:     p?.subtitle     || '',
  description:  p?.description  || '',
  location:     p?.location     || '',
  date_from:    p?.date_from    || p?.start_date || '',
  date_to:      p?.date_to      || p?.end_date   || '',
  price:        p?.price ?? '',
  spots:        p?.spots ?? '',
  spots_left:   p?.spots_left ?? '',
  external_url: p?.external_url || p?.url || '',
  disciplines:  Array.isArray(p?.disciplines) ? p.disciplines : [],
  tags_raw:     Array.isArray(p?.tags) ? p.tags.join(', ') : (p?.tags || ''),
  expiry_date:  p?.expiry_date  || '',
});
