import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';
import { fileConfig, MULTIPART, withMethodOverride } from '../../utils/uploadUtils';

// ── Public: fetch all approved posts (with optional filters) ──
export const fetchGrowPosts = createAsyncThunk(
  'grow/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.GROW_POSTS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Public: fetch single post detail ──
export const fetchGrowPostDetail = createAsyncThunk(
  'grow/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.GROW_POST_DETAIL}/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Auth: fetch my own posts ──
export const fetchMyGrowPosts = createAsyncThunk(
  'grow/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.GROW_POSTS_MY);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Auth: create a new post — accepts FormData (with cover_image file) or plain JSON ──
export const createGrowPost = createAsyncThunk(
  'grow/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        API_ENDPOINTS.GROW_POSTS,
        payload,
        fileConfig(payload),
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Auth: update own post — also accepts FormData; uses POST+_method=PUT ──
// for multipart (Laravel can't read PUT body as multipart) and real PUT for JSON.
export const updateGrowPost = createAsyncThunk(
  'grow/update',
  async (arg, { rejectWithValue }) => {
    try {
      const id = arg.id;
      if (arg.formData instanceof FormData) {
        const { data } = await axiosInstance.post(
          `${API_ENDPOINTS.GROW_POST_UPDATE}/${id}`,
          withMethodOverride(arg.formData, 'PUT'),
          MULTIPART,
        );
        return data;
      }
      const { id: _ignore, ...payload } = arg;
      const { data } = await axiosInstance.put(
        `${API_ENDPOINTS.GROW_POST_UPDATE}/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Auth: delete own post ──
export const deleteGrowPost = createAsyncThunk(
  'grow/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.GROW_POST_DELETE}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ═══════════════════════════════════════════════════════════════
//  Admin actions — unchanged
// ═══════════════════════════════════════════════════════════════

export const fetchAdminGrowPosts = createAsyncThunk(
  'grow/adminFetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_GROW_POSTS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const approveGrowPost = createAsyncThunk(
  'grow/adminApprove',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_GROW_APPROVE}/${id}/approve`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const rejectGrowPost = createAsyncThunk(
  'grow/adminReject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_GROW_REJECT}/${id}/reject`,
        { reason },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const boostGrowPost = createAsyncThunk(
  'grow/adminBoost',
  async ({ id, is_featured }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_GROW_BOOST}/${id}/boost`,
        { is_featured },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const adminDeleteGrowPost = createAsyncThunk(
  'grow/adminDelete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_GROW_POSTS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);