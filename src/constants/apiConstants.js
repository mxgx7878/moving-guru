// Base URL
export const BASE_URL = 'http://localhost:8000/api';
// export const BASE_URL = 'https://demowebportals.com/moving-guru-backend/public/api';


// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/register',
  LOGIN: '/login',
  ME: '/me',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/password/forgot',
  RESET_PASSWORD: '/password/reset',
  CHANGE_PASSWORD: '/password/change',
 
  // Instructors (studio search)
  INSTRUCTORS: '/instructors',
  INSTRUCTOR_DETAIL: '/instructors',         // append /:id
  SAVE_INSTRUCTOR: '/instructors/save',      // POST with instructor_id
  UNSAVE_INSTRUCTOR: '/instructors/unsave',  // POST with instructor_id
  SAVED_INSTRUCTORS: '/instructors/saved',
 
  // Messages
  CONVERSATIONS: '/conversations',
  MESSAGES: '/conversations',                // append /:id/messages
  SEND_MESSAGE: '/conversations',
 
  // Subscriptions
  PLANS: '/plans',
  CHANGE_PLAN: '/subscription/change',
  CURRENT_SUBSCRIPTION: '/subscription',
 
  // Payments
  PAYMENTS: '/payments',
  DOWNLOAD_INVOICE: '/payments',             // append /:id/invoice
 
  // Jobs / Listings
  JOBS: '/jobs',
 
  // ── Grow Board ────────────────────────────────────────────
  GROW_POSTS: '/grow-posts',                 // GET (public list), POST (create)
  GROW_POST_DETAIL: '/grow-posts',           // GET /:id
  GROW_POSTS_MY: '/grow-posts/my',           // GET (own posts)
  GROW_POST_UPDATE: '/grow-posts',           // PUT /:id
  GROW_POST_DELETE: '/grow-posts',           // DELETE /:id
 
  // Admin grow endpoints
  ADMIN_GROW_POSTS: '/admin/grow-posts',
  ADMIN_GROW_APPROVE: '/admin/grow-posts',   // PATCH /:id/approve
  ADMIN_GROW_REJECT: '/admin/grow-posts',    // PATCH /:id/reject
  ADMIN_GROW_BOOST: '/admin/grow-posts',     // PATCH /:id/boost
};
 

// Roles
export const ROLES = {
  INSTRUCTOR: 'instructor',
  STUDIO: 'studio',
  ADMIN: 'admin',
};

// Async action status
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};
