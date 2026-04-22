import {
  Sprout, BookOpen, Palmtree, Calendar, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';

// Grow post types (training / retreat / event) and their brand colours.
export const GROW_TYPE_META = {
  training: { label: 'Training', icon: BookOpen, color: '#2DA4D6' },
  retreat:  { label: 'Retreat',  icon: Palmtree, color: '#6BE6A4' },
  event:    { label: 'Event',    icon: Calendar, color: '#E89560' },
};

// Status vocabulary for moderation (pending / approved / rejected).
export const GROW_STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
  rejected: { label: 'Rejected', icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200'          },
};

// Tab definitions used by the admin moderation page.
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
