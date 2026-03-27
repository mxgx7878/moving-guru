// Base URL
export const BASE_URL = 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: '/register',
  LOGIN: '/login',
  ME: '/me',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  PROFILE: '/profile',
  FORGOT_PASSWORD: '/password/forgot',
  RESET_PASSWORD: '/password/reset',
};

// Async action status
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};
