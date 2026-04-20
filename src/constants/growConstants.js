import { BookOpen, Palmtree, Calendar, Check, X, Clock } from 'lucide-react';

// Post categories shown in the create form
export const GROW_TYPES = [
  { id: 'training', label: 'Training',  icon: BookOpen, color: '#CE4F56' },
  { id: 'retreat',  label: 'Retreat',   icon: Palmtree, color: '#6BE6A4' },
  { id: 'event',    label: 'Event',     icon: Calendar, color: '#2DA4D6' },
];

// Tabs on the public Grow page (includes "All")
export const GROW_FILTER_TABS = [
  { id: 'all',      label: 'All',      icon: null,     color: '#3E3D38' },
  ...GROW_TYPES,
];

export const GROW_TYPE_ICONS = {
  training: BookOpen,
  retreat:  Palmtree,
  event:    Calendar,
};

export const GROW_TYPE_BG = {
  training: 'bg-[#CE4F56]/10',
  retreat:  'bg-[#6BE6A4]/20',
  event:    'bg-[#2DA4D6]/10',
};

export const GROW_STATUS_BADGE = {
  pending:  { label: 'Pending Review', icon: Clock, class: 'bg-amber-50 text-amber-600 border border-amber-200' },
  approved: { label: 'Approved',       icon: Check, class: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  rejected: { label: 'Rejected',       icon: X,     class: 'bg-red-50 text-red-500 border border-red-200' },
};

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
