import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS, STATUS } from '../../constants/apiConstants';

// ─── Helper to extract error message from Laravel API responses ───
const getErrorMessage = (error) => {
  const res = error.response?.data;
  if (res?.message) return res.message;
  if (res?.errors) {
    // Laravel validation: flatten first error of each field
    const firstErrors = Object.values(res.errors).map((arr) =>
      Array.isArray(arr) ? arr[0] : arr,
    );
    return firstErrors.join(', ');
  }
  return error.message || 'Something went wrong';
};

// ─── Async Thunks ─────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData);
      if (data.data?.token) {
        localStorage.setItem('access_token', data.data.token);
      }
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
      if (data.data?.token) {
        localStorage.setItem('access_token', data.data.token);
      }
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

// ─── Slice ────────────────────────────────────────────────────────

const initialState = {
  user: null,
  token: localStorage.getItem('access_token') || null,
  status: STATUS.IDLE,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearMessage(state) {
      state.message = null;
    },
    resetAuth() {
      localStorage.removeItem('access_token');
      return { ...initialState, token: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ──
      .addCase(registerUser.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.user = payload.data?.user || null;
        state.token = payload.data?.token || state.token;
        state.message = payload.message;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // ── Login ──
      .addCase(loginUser.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.user = payload.data?.user || null;
        state.token = payload.data?.token || state.token;
        state.message = payload.message;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // ── Get Me ──
      .addCase(getMe.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.user = payload.data?.user || payload.data || null;
      })
      .addCase(getMe.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // ── Logout ──
      .addCase(logoutUser.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(logoutUser.fulfilled, () => {
        return { ...initialState, token: null };
      })
      .addCase(logoutUser.rejected, () => {
        return { ...initialState, token: null };
      })

      // ── Refresh ──
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.token = payload.data?.token || state.token;
      })

      // ── Update Profile ──
      .addCase(updateProfile.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.user = payload.data?.user || state.user;
        state.message = payload.message;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // ── Forgot Password ──
      .addCase(forgotPassword.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.message = payload.message;
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // ── Reset Password ──
      .addCase(resetPassword.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.message = payload.message;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const { clearError, clearMessage, resetAuth } = authSlice.actions;
export default authSlice.reducer;
