import {
  BookOpen, Palmtree, Calendar, Clock, CheckCircle2, AlertCircle, Sprout,
  User,
} from 'lucide-react';

// ── Grow post types ───────────────────────────────────────────────
export const GROW_TYPES = [
  { id: 'training', label: 'Teacher Training', icon: BookOpen, color: '#2DA4D6' },
  { id: 'retreat',  label: 'Retreats',         icon: Palmtree, color: '#6BE6A4' },
  { id: 'event',    label: 'Events',           icon: Calendar, color: '#E89560' },
];

export const GROW_TYPE_META = GROW_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }), {},
);

// Public filter tabs — now includes "My Posts" so authors can flip to their
// own listings without leaving the page. Grow.jsx treats 'my' as a source
// switch (shows myPosts instead of the public feed).
export const GROW_FILTER_TABS = [
  { id: 'all', label: 'All Posts' },
  ...GROW_TYPES,
  { id: 'my',  label: 'My Posts', icon: User, color: '#7F77DD' },
];

export const GROW_TYPE_BG = {
  training: 'bg-[#2DA4D6]/10 text-[#2DA4D6]',
  retreat:  'bg-[#6BE6A4]/30 text-[#3E3D38]',
  event:    'bg-[#E89560]/15 text-[#E89560]',
};

// ── Moderation status ─────────────────────────────────────────────
export const GROW_STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200' },
};

export const GROW_STATUS_PUBLIC_CONFIG = {
  pending:  { label: 'Pending Approval', icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Live',             icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Needs Changes',    icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200' },
};

export const GROW_STATUS_TABS = [
  { id: 'pending',  label: 'Pending',  icon: Clock,        color: '#F59E0B' },
  { id: 'approved', label: 'Approved', icon: CheckCircle2, color: '#10B981' },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle,  color: '#EF4444' },
  { id: 'all',      label: 'All',      icon: Sprout,       color: '#7F77DD' },
];

export const GROW_TYPE_OPTIONS = [
  { id: 'all',      label: 'All types' },
  { id: 'training', label: 'Training'  },
  { id: 'retreat',  label: 'Retreat'   },
  { id: 'event',    label: 'Event'     },
];

// ── Pricing tiers for new grow posts ─────────────────────────────
// Authors pick one of these at submission time. Duration sets the post's
// expiry_date; price is charged once. Edits within the live window are free
// (but re-enter admin moderation).
export const GROW_PRICING_TIERS = [
  { id: '1m', label: '1 month',  days:  30, price: 30, blurb: 'Up to 30 days live' },
  { id: '3m', label: '3 months', days:  90, price: 40, blurb: 'Up to 3 months live' },
  { id: '6m', label: '6 months', days: 180, price: 60, blurb: 'Up to 6 months live' },
];

// One-off boost: keeps the post pinned to the top of the feed for 7 days.
export const BOOST_CONFIG = {
  price:    10,
  days:     7,
  label:    'Boost for 1 week',
  blurb:    'Pin your post to the top of the Grow feed for 7 days.',
};

// ── Create/edit form defaults ─────────────────────────────────────
// `show_spots` toggles the spots/spots_left inputs in the UI. When false,
// both are sent as null so the post renders without any spots line.
// `cover_image` is the base64 string (new upload) or existing URL.
export const EMPTY_GROW_FORM = {
  type:         'training',
  title:        '',
  subtitle:     '',
  description:  '',
  location:     '',
  date_from:    '',
  date_to:      '',
  price:        '',
  show_spots:   false,
  spots:        '',
  spots_left:   '',
  external_url: '',
  disciplines:  [],
  tags_raw:     '',
  cover_image:  null,
  cover_image_file: null,
  // expiry_date is no longer free-text on the form — it's derived from the
  // chosen pricing tier on the payment modal. Kept for backwards compat with
  // older records and to let the edit flow echo back the current value.
  expiry_date:  '',
  // Tier selected at submit time (ignored on edit).
  pricing_tier: null,
};