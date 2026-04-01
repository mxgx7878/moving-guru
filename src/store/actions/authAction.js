import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { API_ENDPOINTS } from "../../constants/apiConstants";
import { getErrorMessage } from "../../utils/errorUtils.js";

// Helper — detect FormData and set proper headers
const fileConfig = (payload) =>
  payload instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const config = fileConfig(userData);
      const { data } = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData, config);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ME);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.LOGOUT);
      localStorage.removeItem('access_token');
      return data;
    } catch (error) {
      localStorage.removeItem('access_token');
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.REFRESH);
      if (data.data?.token) {
        localStorage.setItem('access_token', data.data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const config = fileConfig(profileData);
      // Laravel doesn't support PATCH with FormData — use POST + _method override
      if (profileData instanceof FormData) {
        profileData.append('_method', 'PATCH');
        const { data } = await axiosInstance.post(API_ENDPOINTS.PROFILE, profileData, config);
        return data;
      }
      const { data } = await axiosInstance.patch(API_ENDPOINTS.PROFILE, profileData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.CHANGE_PASSWORD, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.RESET_PASSWORD, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);