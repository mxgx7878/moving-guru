import {
  FileText, Megaphone, Calendar, Bell, Globe, Users, Building2, Lock,
} from 'lucide-react';

// Post types (used by both the tab bar and the individual post cards).
export const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#E89560' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#2DA4D6' },
];

export const POST_TYPE_TABS = [
  { id: 'all', label: 'All', icon: FileText, color: '#3E3D38' },
  ...POST_TYPES,
];

// Audience options for both the filter dropdown and the <AudiencePill>.
export const POST_AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

// Config for the published/draft status pill.
export const PUBLISH_STATUS_CONFIG = {
  published: { label: 'Published', icon: Globe, cls: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Draft',     icon: Lock,  cls: 'bg-gray-50 text-gray-700 border-gray-200'     },
};
