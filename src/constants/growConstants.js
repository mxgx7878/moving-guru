import {
  BookOpen, Palmtree, Calendar, Clock, CheckCircle2, AlertCircle, Sprout,
  User,
} from 'lucide-react';

export const GROW_TYPES = [
  { id: 'training', label: 'Teacher Training', icon: BookOpen, color: '#4E7A1B' },
  { id: 'retreat',  label: 'Retreats',         icon: Palmtree, color: '#4E7A1B' },
  { id: 'event',    label: 'Events',           icon: Calendar, color: '#4E7A1B' },
];

export const GROW_TYPE_META = GROW_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }), {},
);

export const GROW_FILTER_TABS = [
  { id: 'all', label: 'All Posts' },
  ...GROW_TYPES,
  { id: 'my',  label: 'My Posts', icon: User, color: '#4E7A1B' },
];

export const GROW_TYPE_BG = {
  training: 'bg-coral/10 text-[#3E3D38]',
  retreat:  'bg-[#B4FF5A]/30 text-[#3E3D38]',
  event:    'bg-[#9BE63D]/15 text-[#3E3D38]',
};

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
  { id: 'pending',  label: 'Pending',  icon: Clock,        color: '#C9A227' },
  { id: 'approved', label: 'Approved', icon: CheckCircle2, color: '#4E7A1B' },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle,  color: '#FF0000' },
  { id: 'all',      label: 'All',      icon: Sprout,       color: '#4E7A1B' },
];

export const GROW_TYPE_OPTIONS = [
  { id: 'all',      label: 'All types' },
  { id: 'training', label: 'Training'  },
  { id: 'retreat',  label: 'Retreat'   },
  { id: 'event',    label: 'Event'     },
];

export const BOOST_CONFIG = {
  price:    10,
  days:     7,
  label:    'Boost for 1 week',
  blurb:    'Pin your post to the top of the Grow feed for 7 days.',
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
  show_spots:   false,
  spots:        '',
  spots_left:   '',
  external_url: '',
  disciplines:  [],
  tags_raw:     '',
  cover_image:  null,
  cover_image_file: null,
  expiry_date:  '',
  pricing_tier: null,
};
