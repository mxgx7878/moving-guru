import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

// ═══════════════════════════════════════════════════════════════
//  Dashboard
// ═══════════════════════════════════════════════════════════════

export const fetchAdminDashboardStats = createAsyncThunk(
  'admin/dashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchAdminDashboardActivity = createAsyncThunk(
  'admin/dashboardActivity',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_ACTIVITY);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ═══════════════════════════════════════════════════════════════
//  User management (instructors + studios)
// ═══════════════════════════════════════════════════════════════

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchAdminUserDetail = createAsyncThunk(
  'admin/fetchUserDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.ADMIN_USER_DETAIL}/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateAdminUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_UPDATE}/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const suspendAdminUser = createAsyncThunk(
  'admin/suspendUser',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_SUSPEND}/${id}/suspend`,
        { reason },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const activateAdminUser = createAsyncThunk(
  'admin/activateUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_ACTIVATE}/${id}/activate`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const verifyAdminUser = createAsyncThunk(
  'admin/verifyUser',
  async ({ id, is_verified = true }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_VERIFY}/${id}/verify`,
        { is_verified },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteAdminUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_USER_DELETE}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ═══════════════════════════════════════════════════════════════
//  Platform posts / events (admin-broadcast announcements)
// ═══════════════════════════════════════════════════════════════

export const fetchAdminPosts = createAsyncThunk(
  'admin/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_POSTS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createAdminPost = createAsyncThunk(
  'admin/createPost',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_POSTS, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateAdminPost = createAsyncThunk(
  'admin/updatePost',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(
        `${API_ENDPOINTS.ADMIN_POST_UPDATE}/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteAdminPost = createAsyncThunk(
  'admin/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_POST_DELETE}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const publishAdminPost = createAsyncThunk(
  'admin/publishPost',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_POST_PUBLISH}/${id}/publish`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const unpublishAdminPost = createAsyncThunk(
  'admin/unpublishPost',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_POST_UNPUBLISH}/${id}/unpublish`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
