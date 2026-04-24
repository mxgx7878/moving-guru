// Normalize a Grow post coming from the API into the shape the create/edit
// form expects. Shared by GrowPostForm and admin preview.
export const postToGrowForm = (p) => {
  const spots      = p?.spots ?? '';
  const spotsLeft  = p?.spots_left ?? '';
  // If the post was originally saved with spots data, default the toggle on
  // so editors can see the values; otherwise default off (hidden fields).
  const showSpots  = spots !== '' || spotsLeft !== '';

  const images = Array.isArray(p?.images) ? p.images : [];

  return {
    type:             p?.type         || 'training',
    title:            p?.title        || '',
    subtitle:         p?.subtitle     || '',
    description:      p?.description  || '',
    location:         p?.location     || '',
    date_from:        p?.date_from    || p?.start_date || '',
    date_to:          p?.date_to      || p?.end_date   || '',
    price:            p?.price ?? '',
    show_spots:       showSpots,
    spots:            spots,
    spots_left:       spotsLeft,
    external_url:     p?.external_url || p?.url || '',
    disciplines:      Array.isArray(p?.disciplines) ? p.disciplines : [],
    tags_raw:         Array.isArray(p?.tags) ? p.tags.join(', ') : (p?.tags || ''),
    cover_image:      images[0] || null,
    cover_image_file: null,
    expiry_date:      p?.expiry_date  || p?.expires_at || '',
    pricing_tier:     null, // not part of stored data
  };
};