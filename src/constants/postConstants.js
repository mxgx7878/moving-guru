import {
  FileText, Megaphone, Calendar, Bell, Globe, Users, Building2, Lock,
} from 'lucide-react';

export const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#4E7A1B' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#9BE63D' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#4E7A1B' },
];

export const POST_TYPE_TABS = [
  { id: 'all', label: 'All', icon: FileText, color: '#3E3D38' },
  ...POST_TYPES,
];

export const POST_TYPE_META = POST_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {},
);

export const POST_AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

export const PUBLISH_STATUS_CONFIG = {
  published: { label: 'Published', icon: Globe, cls: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Draft',     icon: Lock,  cls: 'bg-gray-50 text-gray-700 border-gray-200'     },
};
