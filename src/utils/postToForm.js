export const postToGrowForm = (p) => {
  const spots      = p?.spots ?? '';
  const spotsLeft  = p?.spots_left ?? '';
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
    pricing_tier:     null,
  };
};
