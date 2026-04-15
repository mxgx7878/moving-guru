// ═══════════════════════════════════════════════════════════════════
// ADMIN DUMMY DATA — fallback until backend APIs are ready
// ═══════════════════════════════════════════════════════════════════

// ─── Users (instructors + studios) ────────────────────────────────
export const DUMMY_ADMIN_USERS = [
  {
    id: 'usr_101', role: 'instructor',
    name: 'Bambi Romanowski', email: 'bambi@movingguru.co',
    phone: '+61 400 111 222', location: 'Sydney, Australia',
    is_active: true, is_verified: false, status: 'active',
    disciplines: ['Reformer Pilates', 'Mat Pilates', 'Barre'],
    bio: 'Reformer instructor travelling South America Aug–Oct 2026.',
    created_at: '2026-01-15T10:00:00Z', last_login_at: '2026-04-14T08:30:00Z',
    stats: { applications_count: 9, saved_by_count: 18, grow_posts_count: 1 },
  },
  {
    id: 'usr_102', role: 'studio',
    name: 'Imagine Studios', studio_name: 'Imagine Studios',
    email: 'hello@imaginestudios.com',
    phone: '+66 80 123 4567', location: 'Koh Samui, Thailand',
    is_active: true, is_verified: true, status: 'active',
    amenities: ['Reformer Beds (12)', 'Spring Wall', 'Cardio Equipment'],
    description: 'Internationally recognised Pilates studio offering teacher trainings.',
    created_at: '2025-09-04T12:00:00Z', last_login_at: '2026-04-15T07:20:00Z',
    stats: { jobs_count: 4, saved_by_count: 32, grow_posts_count: 3 },
  },
  {
    id: 'usr_103', role: 'instructor',
    name: 'Rohan Mehta', email: 'rohan@example.com',
    phone: '+91 98765 43210', location: 'Goa, India',
    is_active: true, is_verified: false, status: 'active',
    disciplines: ['Vinyasa Yoga', 'Ashtanga Yoga', 'Meditation'],
    created_at: '2026-02-20T09:00:00Z', last_login_at: '2026-04-13T18:00:00Z',
    stats: { applications_count: 4, saved_by_count: 11, grow_posts_count: 0 },
  },
  {
    id: 'usr_104', role: 'studio',
    name: 'Ubud Wellness Collective', studio_name: 'Ubud Wellness Collective',
    email: 'team@ubudwellness.id',
    phone: '+62 361 9988 776', location: 'Ubud, Bali, Indonesia',
    is_active: true, is_verified: false, status: 'pending',
    amenities: ['Outdoor Shala', 'Sound Healing Space', 'Vegan Cafe'],
    description: 'Boutique wellness retreat centre in the heart of Ubud.',
    created_at: '2026-03-12T14:00:00Z', last_login_at: null,
    stats: { jobs_count: 1, saved_by_count: 7, grow_posts_count: 1 },
  },
  {
    id: 'usr_105', role: 'instructor',
    name: 'Ana Martins', email: 'ana@example.com',
    phone: '+351 91 234 5678', location: 'Lisbon, Portugal',
    is_active: false, is_verified: false, status: 'suspended',
    disciplines: ['Yin Yoga', 'Breathwork / Pranayama'],
    created_at: '2025-11-08T11:00:00Z', last_login_at: '2026-03-02T10:15:00Z',
    suspended_at: '2026-03-15T09:00:00Z',
    suspension_reason: 'Multiple spam reports from studios.',
    stats: { applications_count: 2, saved_by_count: 0, grow_posts_count: 0 },
  },
  {
    id: 'usr_106', role: 'studio',
    name: 'Reformer Republic', studio_name: 'Reformer Republic',
    email: 'studio@reformerrepublic.com',
    phone: '+1 415 555 0142', location: 'San Francisco, USA',
    is_active: true, is_verified: true, status: 'active',
    amenities: ['10 Reformer Beds', 'Cadillac', 'Jump Board'],
    description: 'Classical Pilates studio in the heart of SF.',
    created_at: '2025-06-10T08:00:00Z', last_login_at: '2026-04-15T01:00:00Z',
    stats: { jobs_count: 6, saved_by_count: 45, grow_posts_count: 2 },
  },
];

// ─── Platform posts / events (admin-broadcast) ────────────────────
export const DUMMY_PLATFORM_POSTS = [
  {
    id: 'post_001', type: 'announcement', status: 'published',
    title: 'New Job Listings filter is now live',
    body:  'Studios can now filter applicants by qualification level and discipline. Instructors will see better-matched opportunities in Find Work.',
    audience: 'all', is_pinned: true,
    cover_url: null, link_url: '/portal/find-work', link_label: 'Try it',
    event_date: null, event_location: null,
    published_at: '2026-04-12T09:00:00Z', created_at: '2026-04-11T17:00:00Z',
  },
  {
    id: 'post_002', type: 'event', status: 'published',
    title: 'Spring Yoga Festival — virtual meetup',
    body:  'Join 200+ teachers across the platform for a 3-day virtual yoga festival. Daily classes, panel discussions and a networking lounge.',
    audience: 'instructors', is_pinned: false,
    cover_url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=900',
    link_url: 'https://example.com/spring-festival', link_label: 'RSVP',
    event_date: '2026-05-20T18:00:00Z', event_location: 'Online · Zoom',
    published_at: '2026-04-08T10:00:00Z', created_at: '2026-04-07T12:00:00Z',
  },
  {
    id: 'post_003', type: 'news', status: 'published',
    title: 'Studio Verification badge rolled out',
    body:  'Verified studios now appear with a green shield in instructor search results. Submit your trade documents from Settings to apply.',
    audience: 'studios', is_pinned: false,
    cover_url: null, link_url: '/studio/profile', link_label: 'Open profile',
    event_date: null, event_location: null,
    published_at: '2026-03-30T08:00:00Z', created_at: '2026-03-29T15:00:00Z',
  },
  {
    id: 'post_004', type: 'announcement', status: 'draft',
    title: 'Coming soon: in-app video calls',
    body:  'We\'re working on bringing video interviews directly into the messages tab. More details next week.',
    audience: 'all', is_pinned: false,
    cover_url: null, link_url: null, link_label: null,
    event_date: null, event_location: null,
    published_at: null, created_at: '2026-04-14T11:00:00Z',
  },
];

// ─── Dashboard stats + activity ───────────────────────────────────
export const DUMMY_DASHBOARD_STATS = {
  signups_today: 12,
  instructors:     { total: 1240, new_this_month: 45, growth: 8 },
  studios:         { total: 187,  new_this_month: 6,  growth: 3 },
  grow_posts:      { total: 320, pending: 12, approved: 280, rejected: 28 },
  jobs:            { total: 95,  active: 62 },
  subscriptions:   { active: 540, trialing: 35, cancelled_this_month: 8 },
  platform_posts:  { published: 14, draft: 3 },
};

export const DUMMY_DASHBOARD_ACTIVITY = {
  pending_grow_posts: [
    { id: 'g1', title: 'Bali 200hr Yoga TT', type: 'training', posted_by: 'Ubud Wellness Collective', created_at: '2026-04-15T07:00:00Z' },
    { id: 'g2', title: 'Reformer Workshop Weekend', type: 'event', posted_by: 'Reformer Republic',       created_at: '2026-04-14T18:30:00Z' },
    { id: 'g3', title: 'Mexico Surf & Yoga Retreat', type: 'retreat', posted_by: 'Tulum Movement',       created_at: '2026-04-13T12:00:00Z' },
  ],
  recent_signups: [
    { id: 'u1', name: 'Maya Patel',     email: 'maya@example.com',  role: 'instructor', created_at: '2026-04-15T08:30:00Z' },
    { id: 'u2', name: 'Flow Studio',    email: 'team@flow.studio',  role: 'studio',     created_at: '2026-04-15T06:15:00Z' },
    { id: 'u3', name: 'Liam O\'Connor', email: 'liam@example.com',  role: 'instructor', created_at: '2026-04-14T22:00:00Z' },
  ],
  recent_jobs: [
    { id: 'j1', title: 'Senior Reformer Instructor', studio_name: 'Imagine Studios',     location: 'Koh Samui',  is_active: true  },
    { id: 'j2', title: 'Vinyasa Cover (2 weeks)',    studio_name: 'Ubud Wellness',       location: 'Ubud',       is_active: true  },
    { id: 'j3', title: 'Weekend Mat Pilates Sub',     studio_name: 'Reformer Republic',  location: 'San Francisco', is_active: false },
  ],
  recent_subscriptions: [
    { id: 's1', user: { name: 'Maya Patel' },     plan_name: 'Pro Monthly',  status: 'active',   created_at: '2026-04-15T09:00:00Z' },
    { id: 's2', user: { name: 'Reformer Republic' }, plan_name: 'Studio Plus', status: 'active', created_at: '2026-04-14T10:30:00Z' },
    { id: 's3', user: { name: 'Ana Martins' },    plan_name: 'Free',         status: 'cancelled', created_at: '2026-04-13T18:00:00Z' },
  ],
};
