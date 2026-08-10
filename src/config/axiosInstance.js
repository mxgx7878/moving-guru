import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../constants/apiConstants';

let store;
let authActions;

export const injectStore = (_store, _authActions) => {
  store = _store;
  authActions = _authActions;
};

const SKIP_REFRESH_ROUTES = [
  API_ENDPOINTS.LOGIN,
  API_ENDPOINTS.REGISTER,
  API_ENDPOINTS.FORGOT_PASSWORD,
  API_ENDPOINTS.RESET_PASSWORD,
];

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

     if (
      error.response?.status === 402
      && error.response?.data?.code === 'SUBSCRIPTION_REQUIRED'
      && window.location.pathname !== '/checkout'
    ) {
      window.location.replace(error.response.data.redirectTo || '/checkout');
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isPublicRoute = SKIP_REFRESH_ROUTES.some((route) => requestUrl.includes(route));

    if (error.response?.status !== 401 || originalRequest._retry || isPublicRoute) {
      return Promise.reject(error);
    }

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

      localStorage.setItem('access_token', newToken);

      if (store && authActions) {
        store.dispatch(authActions.setToken(newToken));
      }

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
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
