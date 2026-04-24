import { Instagram, Facebook, Twitter, Youtube, Linkedin, Music } from 'lucide-react';

export const PRONOUNS = ['She/Her', 'He/Him', 'They/Them', 'She/They', 'He/They', 'Prefer not to say'];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Polish', 'Turkish',
];

export const OPEN_TO = ['Direct Hire', 'Swaps'];

export const OPEN_TO_COLORS = {
  'Direct Hire':     '#2DA4D6',
  'Swaps':           '#E89560',
  'Energy Exchange': '#6BE6A4',
};

export const STUDIO_SIZES = [
  '1–5 instructors',
  '6–15 instructors',
  '16–30 instructors',
  '30+ instructors',
];

// Mirrors ROLE_TYPE_OPTIONS from jobConstants but spelled to match the
// studio-profile form field names. Kept separate so renaming stays safe.
export const POSITION_TYPES = [
  { id: 'permanent',     label: 'Permanent'                  },
  { id: 'temporary',     label: 'Temporary'                  },
  { id: 'substitute',    label: 'Substitute'                 },
  { id: 'weekend_cover', label: 'Substitute for the weekend' },
  { id: 'casual',        label: 'Casual / On-call'           },
];

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { key: 'facebook',  label: 'Facebook',  icon: Facebook,  color: '#1877F2' },
  { key: 'twitter',   label: 'Twitter',   icon: Twitter,   color: '#1DA1F2' },
  { key: 'tiktok',    label: 'TikTok',    icon: Music,     color: '#000000' },
  { key: 'youtube',   label: 'YouTube',   icon: Youtube,   color: '#FF0000' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  color: '#0077B5' },
];
