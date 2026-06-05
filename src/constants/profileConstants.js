import { Instagram, Facebook, Twitter, Youtube, Linkedin, Music } from 'lucide-react';

export const PRONOUNS = ['She/Her', 'He/Him', 'They/Them', 'She/They', 'He/They', 'Prefer not to say'];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Polish', 'Turkish',
];

export const OPEN_TO          = ['Direct Hire', 'Swaps'];
export const OPEN_TO_FULL     = ['Direct Hire', 'Swaps', 'Energy Exchange'];
export const ENERGY_EXCHANGE  = 'Energy Exchange';

export const OPEN_TO_COLORS = {
  'Direct Hire':     '#4E7A1B',
  'Swaps':           '#9BE63D',
  'Energy Exchange': '#B4FF5A',
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
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#1A1A1A' },
  { key: 'facebook',  label: 'Facebook',  icon: Facebook,  color: '#1A1A1A' },
  { key: 'twitter',   label: 'Twitter',   icon: Twitter,   color: '#1A1A1A' },
  { key: 'tiktok',    label: 'TikTok',    icon: Music,     color: '#000000' },
  { key: 'youtube',   label: 'YouTube',   icon: Youtube,   color: '#1A1A1A' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  color: '#1A1A1A' },
];
