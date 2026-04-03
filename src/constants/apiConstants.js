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
  INSTRUCTOR_DETAIL: '/instructors', // append /:id
  SAVE_INSTRUCTOR: '/instructors/save', // POST with instructor_id
  UNSAVE_INSTRUCTOR: '/instructors/unsave', // POST with instructor_id
  SAVED_INSTRUCTORS: '/instructors/saved',

  // Messages
  CONVERSATIONS: '/conversations',
  MESSAGES: '/conversations', // append /:id/messages
  SEND_MESSAGE: '/conversations', // POST /:id/messages or POST /conversations

  // Subscriptions
  PLANS: '/plans',
  CHANGE_PLAN: '/subscription/change',
  CURRENT_SUBSCRIPTION: '/subscription',

  // Payments
  PAYMENTS: '/payments',
  DOWNLOAD_INVOICE: '/payments', // append /:id/invoice
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
