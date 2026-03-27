import axios from 'axios';
import { BASE_URL } from '../constants/apiConstants';

// Store reference — injected from main.jsx to avoid circular imports
let store;
let authActions; // { setToken, resetAuth }

export const injectStore = (_store, _authActions) => {
  store = _store;
  authActions = _authActions;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Prevent multiple refresh calls at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 (token expired) with auto-refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 — skip if already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If refresh is in progress, queue this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use plain axios (NOT axiosInstance) to avoid infinite interceptor loop
      const { data } = await axios.post(
        `${BASE_URL}/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );

      const newToken = data.data?.token || data.data?.access_token;

      if (!newToken) {
        throw new Error('No token returned from refresh');
      }

      // 1. Update localStorage
      localStorage.setItem('access_token', newToken);

      // 2. Update Redux store (keeps UI in sync)
      if (store && authActions) {
        store.dispatch(authActions.setToken(newToken));
      }

      // 3. Retry all queued requests with new token
      processQueue(null, newToken);

      // 4. Retry the original failed request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear auth, let ProtectedRoute redirect to /login
      localStorage.removeItem('access_token');

      if (store && authActions) {
        store.dispatch(authActions.resetAuth());
      }

      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
