import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

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

// ── Auth: create a new post ──
export const createGrowPost = createAsyncThunk(
  'grow/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.GROW_POSTS, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Auth: update own post ──
export const updateGrowPost = createAsyncThunk(
  'grow/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
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
      return id; // return id so we can remove it from state
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);