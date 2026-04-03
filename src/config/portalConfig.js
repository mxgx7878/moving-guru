import {
  LayoutDashboard, User, MessageCircle, Star, CreditCard,
  Building2, Search, Users, FileText, Settings, Shield
} from 'lucide-react';

// ─── Role themes ─────────────────────────────────────────────────
// accent = active nav highlight, ring = avatar gradient, label = portal subtitle
export const ROLE_THEME = {
  instructor: {
    accent: '#CE4F56',
    accentLight: '#CE4F56/10',
    avatarGradient: 'from-[#CE4F56] to-[#E89560]',
    label: 'Member Portal',
    defaultPath: '/portal/dashboard',
  },
  studio: {
    accent: '#2DA4D6',
    accentLight: '#2DA4D6/10',
    avatarGradient: 'from-[#2DA4D6] to-[#2590bd]',
    label: 'Studio Portal',
    defaultPath: '/studio/dashboard',
  },
  admin: {
    accent: '#7F77DD',
    accentLight: '#7F77DD/10',
    avatarGradient: 'from-[#7F77DD] to-[#534AB7]',
    label: 'Admin Portal',
    defaultPath: '/admin/dashboard',
  },
};

// ─── Nav items per role ───────────────────────────────────────────
export const NAV_CONFIG = {
  instructor: [
    { to: '/portal/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/portal/profile',     icon: User,            label: 'My Profile' },
    { to: '/portal/messages',    icon: MessageCircle,   label: 'Messages' },
    { to: '/portal/subscription',icon: Star,            label: 'Subscription' },
    { to: '/portal/payments',    icon: CreditCard,      label: 'Payment History' },
  ],
  studio: [
    { to: '/studio/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/studio/profile',      icon: Building2,       label: 'Studio Profile' },
    { to: '/studio/search',       icon: Search,          label: 'Find Instructors' },
    { to: '/studio/messages',     icon: MessageCircle,   label: 'Messages' },
    { to: '/studio/subscription', icon: Star,            label: 'Subscription' },
    { to: '/studio/payments',     icon: CreditCard,      label: 'Payment History' },
  ],
  admin: [
    { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users',         icon: Users,           label: 'Users' },
    { to: '/admin/studios',       icon: Building2,       label: 'Studios' },
    { to: '/admin/posts',         icon: FileText,        label: 'Posts / Events' },
    { to: '/admin/subscriptions', icon: Star,            label: 'Subscriptions' },
    { to: '/admin/settings',      icon: Settings,        label: 'Settings' },
  ],
};