import {
  BookOpen, Palmtree, Calendar, Clock, CheckCircle2, AlertCircle, Sprout,
} from 'lucide-react';

// ── Grow post types ───────────────────────────────────────────────
// Canonical palette used by the public Grow feed, the create form,
// and the admin moderation view. Blue = training, green = retreat,
// orange = event. Any visual change here propagates everywhere.
export const GROW_TYPES = [
  { id: 'training', label: 'Teacher Training', icon: BookOpen, color: '#2DA4D6' },
  { id: 'retreat',  label: 'Retreats',         icon: Palmtree, color: '#6BE6A4' },
  { id: 'event',    label: 'Events',           icon: Calendar, color: '#E89560' },
];

// Lookup by id for quick meta access. Shape matches individual GROW_TYPES
// entries so it's a drop-in when you already have a type string.
export const GROW_TYPE_META = GROW_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {},
);

// Filter tabs — prepends "All" to the public Grow page tabs.
export const GROW_FILTER_TABS = [
  { id: 'all', label: 'All Posts', color: '#3E3D38' },
  ...GROW_TYPES,
];

// Tailwind background + text helper classes (used by card rendering
// where the author wants tinted pills, not the flat color dot).
export const GROW_TYPE_BG = {
  training: 'bg-[#2DA4D6]/10 text-[#2DA4D6]',
  retreat:  'bg-[#6BE6A4]/30 text-[#3E3D38]',
  event:    'bg-[#E89560]/15 text-[#E89560]',
};

// ── Moderation status ─────────────────────────────────────────────
// Shape matches the StatusPill `config` prop — `{ label, icon, cls }`.
//
// Admin-facing labels (used on the moderation queue).
export const GROW_STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
  rejected: { label: 'Rejected', icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200'          },
};

// Author-facing labels (used on the public Grow page so authors see
// "Live" instead of "Approved" on their own posts). Same keys so both
// configs stay interchangeable.
export const GROW_STATUS_PUBLIC_CONFIG = {
  pending:  { label: 'Pending Approval', icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Live',             icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
  rejected: { label: 'Rejected',         icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200'          },
};

// Tab definitions used by the admin moderation page.
export const GROW_STATUS_TABS = [
  { id: 'pending',  label: 'Pending',  icon: Clock,        color: '#F59E0B' },
  { id: 'approved', label: 'Approved', icon: CheckCircle2, color: '#10B981' },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle,  color: '#EF4444' },
  { id: 'all',      label: 'All',      icon: Sprout,       color: '#7F77DD' },
];

// Options for the "All types" filter dropdown on the admin page.
export const GROW_TYPE_OPTIONS = [
  { id: 'all',      label: 'All types' },
  { id: 'training', label: 'Training'  },
  { id: 'retreat',  label: 'Retreat'   },
  { id: 'event',    label: 'Event'     },
];

// ── Create/edit form defaults ─────────────────────────────────────
export const EMPTY_GROW_FORM = {
  type:         'training',
  title:        '',
  subtitle:     '',
  description:  '',
  location:     '',
  date_from:    '',
  date_to:      '',
  price:        '',
  spots:        '',
  spots_left:   '',
  external_url: '',
  disciplines:  [],
  tags_raw:     '',
  expiry_date:  '',
};
