import {
  FileText, Megaphone, Calendar, Bell, Globe, Users, Building2, Lock,
} from 'lucide-react';

// Platform announcements / events / news posted by admins to the feed.

// ── Post types ────────────────────────────────────────────────────
// Shared by the admin announcements page, the create form, and the
// public/preview modal.
export const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#E89560' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#2DA4D6' },
];

// Tab definitions — prepends an "All" tab to POST_TYPES.
export const POST_TYPE_TABS = [
  { id: 'all', label: 'All', icon: FileText, color: '#3E3D38' },
  ...POST_TYPES,
];

// Lookup by id for quick meta access. Same shape as individual entries
// so it's a drop-in when you already have a post.type string.
export const POST_TYPE_META = POST_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {},
);

// Audience options for both the filter dropdown and the AudiencePill.
export const POST_AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

// ── Publish status ────────────────────────────────────────────────
// Shape matches the StatusPill `config` prop.
export const PUBLISH_STATUS_CONFIG = {
  published: { label: 'Published', icon: Globe, cls: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Draft',     icon: Lock,  cls: 'bg-gray-50 text-gray-700 border-gray-200'     },
};
