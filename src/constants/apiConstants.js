// Base URL
export const BASE_URL = "http://localhost:8000/api";
// export const BASE_URL = 'https://demowebportals.com/moving-guru-backend/public/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/register",
  LOGIN: "/login",
  ME: "/me",
  LOGOUT: "/logout",
  REFRESH: "/refresh",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/password/forgot",
  RESET_PASSWORD: "/password/reset",
  CHANGE_PASSWORD: "/password/change",

  // Instructors (studio search)
  INSTRUCTORS: "/instructors",
  ME_INSTRUCTORS: "/me/instructors", // GET (studio's own profile), PUT (update)
  INSTRUCTOR_DETAIL: "/instructors", // append /:id
  SAVE_INSTRUCTOR: "/instructors/save", // POST with instructor_id
  UNSAVE_INSTRUCTOR: "/instructors/unsave", // POST with instructor_id
  SAVED_INSTRUCTORS: "/instructors/saved",

  DASHBOARD_INSTRUCTOR: "/dashboard/instructor",
  
  // Studios (instructor-side discovery)
  STUDIOS: "/studios",
  STUDIO_DETAIL: "/studios", // append /:id
  DASHBOARD_STUDIO:     "/dashboard/studio",

  // Messages
  CONVERSATIONS: "/conversations",
  MESSAGES: "/conversations", // append /:id/messages
  SEND_MESSAGE: "/conversations",

  // Subscriptions
  PLANS: "/plans",
  CHANGE_PLAN: "/subscription/change",
  CURRENT_SUBSCRIPTION: "/subscription",

  // Payments
  PAYMENTS: "/payments",
  DOWNLOAD_INVOICE: "/payments", // append /:id/invoice

  // Jobs / Listings
  JOBS: "/jobs", // GET browse (all roles) | POST create (studio)
  JOBS_MINE: "/jobs/mine", // GET studio's own listings (active + inactive)
  JOB_DETAIL: "/jobs", // GET /:id | PATCH /:id | DELETE /:id
  JOB_APPLY: "/jobs", // POST /:id/apply (instructor)
  JOB_APPLICANTS: "/jobs", // GET /:id/applicants (studio)

  APPLICATIONS: "/applications", // DELETE /:id (instructor withdraws)
  APPLICATIONS_MINE: "/applications/mine", // GET instructor's own applications
  APPLICATION_STATUS: "/applications", // PATCH /:id/status  (studio accept/reject)

  REVIEWS: "/reviews", // POST create
  REVIEWS_MINE: "/reviews/mine", // GET my reviews
  REVIEWS_ELIGIBLE: "/reviews/eligible", // GET pairs I can still review
  USER_REVIEWS: "/users",

  // ── Grow Board ────────────────────────────────────────────
  GROW_POSTS: "/grow-posts", // GET (public list), POST (create)
  GROW_POST_DETAIL: "/grow-posts", // GET /:id
  GROW_POSTS_MY: "/grow-posts/my", // GET (own posts)
  GROW_POST_UPDATE: "/grow-posts", // PUT /:id
  GROW_POST_DELETE: "/grow-posts", // DELETE /:id

  // Admin grow endpoints
  ADMIN_GROW_POSTS: "/admin/grow-posts",
  ADMIN_GROW_APPROVE: "/admin/grow-posts", // PATCH /:id/approve
  ADMIN_GROW_REJECT: "/admin/grow-posts", // PATCH /:id/reject
  ADMIN_GROW_BOOST: "/admin/grow-posts", // PATCH /:id/boost

  // ── Admin: Dashboard ─────────────────────────────────────
  ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats", // GET — overview counters + trends
  ADMIN_DASHBOARD_ACTIVITY: "/admin/dashboard/activity", // GET — recent signups, posts, jobs
  ADMIN_DASHBOARD_REVENUE: "/admin/dashboard/revenue",

  // ── Admin: Users (instructors + studios) ─────────────────
  // Filterable list: ?role=instructor|studio&status=active|suspended|pending&q=...&page=
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_CREATE: "/admin/users",
  ADMIN_USER_DETAIL: "/admin/users", // GET /:id
  ADMIN_USER_UPDATE: "/admin/users", // PATCH /:id  body: { is_active, is_verified, role, ... }
  ADMIN_USER_SUSPEND: "/admin/users", // PATCH /:id/suspend  body: { reason }
  ADMIN_USER_ACTIVATE: "/admin/users", // PATCH /:id/activate
  ADMIN_USER_APPROVE: "/admin/users", // PATCH /:id/approve
  ADMIN_USER_REJECT: "/admin/users",
  ADMIN_USER_VERIFY: "/admin/users", // PATCH /:id/verify   (studios)
  ADMIN_USER_DELETE: "/admin/users", // DELETE /:id

  // ── Admin: Platform posts / events (broadcast announcements) ─
  ADMIN_POSTS: "/admin/posts", // GET, POST
  ADMIN_POST_DETAIL: "/admin/posts", // GET /:id
  ADMIN_POST_UPDATE: "/admin/posts", // PUT /:id
  ADMIN_POST_DELETE: "/admin/posts", // DELETE /:id
  ADMIN_POST_PUBLISH: "/admin/posts", // PATCH /:id/publish
  ADMIN_POST_UNPUBLISH: "/admin/posts", // PATCH /:id/unpublish

  // ── Admin: Job management ────────────────────────────────
  ADMIN_JOBS: "/admin/jobs", // GET list with filters
  ADMIN_JOB_DETAIL: "/admin/jobs", // GET /:id (includes applicants)
  ADMIN_JOB_APPLICANTS: "/admin/jobs", // GET /:id/applicants
  ADMIN_JOB_DEACTIVATE: "/admin/jobs", // PATCH /:id/deactivate
  ADMIN_JOB_ACTIVATE: "/admin/jobs", // PATCH /:id/activate
  ADMIN_JOB_DELETE: "/admin/jobs",

  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_REVIEW_DELETE: "/reviews", // DELETE /:id
  ADMIN_USER_PLAN: "/admin/users",
  ADMIN_USERS_STALE_SWEEP: "/admin/users/run-stale-sweep",

  ADMIN_EMAIL_BROADCAST: "/admin/emails/broadcast",
  ADMIN_EMAIL_AUDIENCE_COUNTS: "/admin/emails/audience-counts",

  PLANS:                  '/plans',
  CURRENT_SUBSCRIPTION:   '/subscription',
  SETUP_INTENT:           '/subscription/setup-intent',
  ATTACH_PAYMENT_METHOD:  '/subscription/payment-method',
  CHANGE_PLAN:            '/subscription/change',
  CANCEL_SUBSCRIPTION:    '/subscription/cancel',
  RESUME_SUBSCRIPTION:    '/subscription/resume',
  ADMIN_PLANS:        '/admin/plans',
  ADMIN_PLAN_DETAIL:  '/admin/plans',

  // Payments
  PAYMENTS:               '/payments',
  DOWNLOAD_INVOICE:       '/payments', // append /:id/invoice

  POSTS: "/posts", // GET list
  POST_DETAIL: "/posts",
};

// Roles
export const ROLES = {
  INSTRUCTOR: "instructor",
  STUDIO: "studio",
  ADMIN: "admin",
};

// Async action status
export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};
