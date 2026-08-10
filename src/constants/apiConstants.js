export const BASE_URL = 'https://movingguru.co/moving-guru-backend/public/api';

export const API_ENDPOINTS = {
  REGISTER: "/register",
  LOGIN: "/login",
  ME: "/me",
  LOGOUT: "/logout",
  REFRESH: "/refresh",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/password/forgot",
  RESET_PASSWORD: "/password/reset",
  CHANGE_PASSWORD: "/password/change",

  INSTRUCTORS: "/instructors",
  ME_INSTRUCTORS: "/me/instructors",
  INSTRUCTOR_DETAIL: "/instructors",
  SAVE_INSTRUCTOR: "/instructors/save",
  UNSAVE_INSTRUCTOR: "/instructors/unsave",
  SAVED_INSTRUCTORS: "/instructors/saved",

  DASHBOARD_INSTRUCTOR: "/dashboard/instructor",

  STUDIOS: "/studios",
  STUDIO_DETAIL: "/studios",
  DASHBOARD_STUDIO: "/dashboard/studio",

  CONVERSATIONS: "/conversations",
  MESSAGES: "/conversations",
  SEND_MESSAGE: "/conversations",

  PLANS: "/plans",
  CHANGE_PLAN: "/subscription/change",
  CURRENT_SUBSCRIPTION: "/subscription",

  PAYMENTS: "/payments",
  DOWNLOAD_INVOICE: "/payments",

  JOBS: "/jobs",
  JOBS_MINE: "/jobs/mine",
  JOB_DETAIL: "/jobs",
  JOB_APPLY: "/jobs",
  JOB_APPLICANTS: "/jobs",

  APPLICATIONS: "/applications",
  APPLICATIONS_MINE: "/applications/mine",
  APPLICATION_STATUS: "/applications",

  REVIEWS: "/reviews",
  REVIEWS_MINE: "/reviews/mine",
  REVIEWS_ELIGIBLE: "/reviews/eligible",
  USER_REVIEWS: "/users",

  GROW_POSTS: "/grow-posts",
  GROW_POST_DETAIL: "/grow-posts",
  GROW_POSTS_MY: "/grow-posts/my",
  GROW_POST_UPDATE: "/grow-posts",
  GROW_POST_DELETE: "/grow-posts",
  GROW_PAYMENT_INTENTS: "/grow-payments/intents",
  GROW_PAYMENT_COMPLETE: "/grow-payments/complete",
  GROW_POST_TIERS: "/grow-post-tiers",
  PUBLIC_GROW_PAYMENT_INTENTS: "/public/grow-payments/intents",
  PUBLIC_GROW_PAYMENT_COMPLETE: "/public/grow-payments/complete",
  PUBLIC_GROW_POSTS: "/public/grow-posts",

  ADMIN_GROW_POSTS: "/admin/grow-posts",
  ADMIN_GROW_APPROVE: "/admin/grow-posts",
  ADMIN_GROW_REJECT: "/admin/grow-posts",
  ADMIN_GROW_BOOST: "/admin/grow-posts",
  ADMIN_GROW_POST_TIERS: "/admin/grow-post-tiers",

  ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats",
  ADMIN_DASHBOARD_ACTIVITY: "/admin/dashboard/activity",
  ADMIN_DASHBOARD_REVENUE: "/admin/dashboard/revenue",

  ADMIN_USERS: "/admin/users",
  ADMIN_USER_CREATE: "/admin/users",
  ADMIN_USER_DETAIL: "/admin/users",
  ADMIN_USER_UPDATE: "/admin/users",
  ADMIN_USER_SUSPEND: "/admin/users",
  ADMIN_USER_ACTIVATE: "/admin/users",
  ADMIN_USER_APPROVE: "/admin/users",
  ADMIN_USER_REJECT: "/admin/users",
  ADMIN_USER_VERIFY: "/admin/users",
  ADMIN_USER_DELETE: "/admin/users",

  ADMIN_POSTS: "/admin/posts",
  ADMIN_POST_DETAIL: "/admin/posts",
  ADMIN_POST_UPDATE: "/admin/posts",
  ADMIN_POST_DELETE: "/admin/posts",
  ADMIN_POST_PUBLISH: "/admin/posts",
  ADMIN_POST_UNPUBLISH: "/admin/posts",

  ADMIN_JOBS: "/admin/jobs",
  ADMIN_JOB_DETAIL: "/admin/jobs",
  ADMIN_JOB_APPLICANTS: "/admin/jobs",
  ADMIN_JOB_DEACTIVATE: "/admin/jobs",
  ADMIN_JOB_ACTIVATE: "/admin/jobs",
  ADMIN_JOB_DELETE: "/admin/jobs",

  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_REVIEW_DELETE: "/reviews",
  ADMIN_USER_PLAN: "/admin/users",
  ADMIN_USERS_STALE_SWEEP: "/admin/users/run-stale-sweep",

  ADMIN_EMAIL_BROADCAST: "/admin/emails/broadcast",
  ADMIN_EMAIL_AUDIENCE_COUNTS: "/admin/emails/audience-counts",

  PLANS: "/plans",
  CURRENT_SUBSCRIPTION: "/subscription",
  SETUP_INTENT: "/subscription/setup-intent",
  ATTACH_PAYMENT_METHOD: "/subscription/payment-method",
  CHANGE_PLAN: "/subscription/change",
  CANCEL_SUBSCRIPTION: "/subscription/cancel",
  RESUME_SUBSCRIPTION: "/subscription/resume",
  ADMIN_PLANS: "/admin/plans",
  ADMIN_PLAN_DETAIL: "/admin/plans",

  PAYMENTS: "/payments",
  DOWNLOAD_INVOICE: "/payments",

  POSTS: "/posts",
  POST_DETAIL: "/posts",

  ADMIN_FEATURES: "/admin/features",
  ADMIN_PLANS_SYNC: "/admin/plans/sync-from-stripe",
  REPORTS: "/reports",
  ADMIN_REPORTS: "/admin/reports",

  ADMIN_PROMO_CODES:       "/admin/promo-codes",
  ADMIN_PROMO_CODE_DETAIL: "/admin/promo-codes",
  PROMO_VALIDATE:          "/promo-codes/validate",
  ADMIN_GROW_PROMO_CODES:       "/admin/grow-promo-codes",
  ADMIN_GROW_PROMO_CODE_DETAIL: "/admin/grow-promo-codes",
  GROW_PROMO_VALIDATE:          "/grow-promo-codes/validate",
  RETRY_SUBSCRIPTION_PAYMENT:
    '/subscription/retry-payment',
};

export const ROLES = {
  INSTRUCTOR: "instructor",
  STUDIO: "studio",
  ADMIN: "admin",
};

export const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};
