import {
  LayoutDashboard, User, MessageCircle, Star, CreditCard,
  Building2, Search, Users, FileText, Settings, Briefcase,
  Heart, Sprout, MapPin, Bookmark, ClipboardList,
  Megaphone,
  Mail,
  Flag,
  Ticket,
} from 'lucide-react';

// ── Per-role theme tokens ────────────────────────────────────────
// `accent` is the dominant brand colour for the portal — used by the
// Sidebar active-state, PageHeader gradient banner, SubscriptionGate
// lock icon, FeatureGate upgrade CTA, etc.
//
// Instructor portal moved from coral (#4E7A1B) to mint green (#B4FF5A)
// to match the public site's refreshed brand. The Login page's left
// hero panel still renders in coral on purpose — see Login.jsx.
//
// Studio (sky blue) and Admin (purple) are unchanged.
export const ROLE_THEME = {
  instructor: {
    accent: '#B4FF5A',
    accentLight: '#B4FF5A/10',
    avatarGradient: 'from-[#B4FF5A] to-[#9BE63D]',
    label: 'Member Portal',
    defaultPath: '/portal/dashboard',
    profilePath: '/portal/profile'
  },
  studio: {
    accent: '#B4FF5A',
    accentLight: '#B4FF5A/10',
    avatarGradient: 'from-coral to-[#3F6216]',
    label: 'Studio Portal',
    defaultPath: '/studio/dashboard',
    profilePath: '/studio/profile'
  },
  admin: {
    accent: '#B4FF5A',
    accentLight: '#B4FF5A/10',
    avatarGradient: 'from-coral to-[#3F6216]',
    label: 'Admin Portal',
    defaultPath: '/admin/dashboard',
    profilePath: '/admin/settings'
  },
};

export const NAV_CONFIG = {
  instructor: [
    { to: '/portal/dashboard',      icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/portal/profile',        icon: User,            label: 'My Profile'      },
    { to: '/portal/find-work',      icon: MapPin,          label: 'Find Work'       },
    { to: '/portal/applications',   icon: ClipboardList,   label: 'My Applications' },
    { to: '/portal/saved-jobs',     icon: Bookmark,        label: 'Saved Jobs'      },
    { to: '/portal/grow',           icon: Sprout,          label: 'Grow'            },
    { to: '/portal/announcements',  icon: Megaphone,       label: 'Announcements'   },
    { to: '/portal/messages',       icon: MessageCircle,   label: 'Messages'        },
    { to: '/portal/subscription',   icon: Star,            label: 'Subscription'    },
    { to: '/portal/payments',       icon: CreditCard,      label: 'Payment History' },
  ],
  studio: [
    { to: '/studio/dashboard',      icon: LayoutDashboard, label: 'Dashboard'          },
    { to: '/studio/profile',        icon: Building2,       label: 'Studio Profile'     },
    { to: '/studio/search',         icon: Search,          label: 'Find Instructors'   },
    { to: '/studio/favourites',     icon: Heart,           label: 'Saved Instructors'  },
    { to: '/studio/jobs',           icon: Briefcase,       label: 'Job Listings'       },
    { to: '/studio/grow',           icon: Sprout,          label: 'Grow'               },
    { to: '/studio/announcements',  icon: Megaphone,       label: 'Announcements'      },
    { to: '/studio/messages',       icon: MessageCircle,   label: 'Messages'           },
    { to: '/studio/subscription',   icon: Star,            label: 'Subscription'       },
    { to: '/studio/payments',       icon: CreditCard,      label: 'Payment History'    },
  ],
  admin: [
    { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard'         },
    { to: '/admin/users',            icon: Users,           label: 'User Management'   },
    { to: '/admin/jobs',             icon: Briefcase,       label: 'Job Listings'      },
    { to: '/admin/grow',             icon: Sprout,          label: 'Grow Posts'        },
    { to: '/admin/announcements',    icon: Megaphone,       label: 'Announcements'     },
    { to: '/admin/subscriptions',    icon: Star,            label: 'Subscriptions'     },
    { to: '/admin/settings',         icon: Settings,        label: 'Settings'          },
    { to: '/admin/reviews',          icon: Star,            label: 'Review Moderation' },
    { to: '/admin/reports',         icon: Flag,            label: 'Reports'           },
    { to: '/admin/communications',   icon: Mail,            label: 'Communications'    },
    { to: '/admin/promo-codes',   icon: Ticket,            label: 'Promo Codes'    },
  ],
};