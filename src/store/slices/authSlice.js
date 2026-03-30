import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { forgotPassword, getMe, loginUser, logoutUser, refreshToken, registerUser, resetPassword, updateProfile } from '../actions/authAction';

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
    setToken(state, { payload }) {
      state.token = payload;
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
        state.token = payload.data?.access_token || state.token;
        localStorage.setItem('access_token', payload.data?.access_token || state.token);
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
        state.token = payload.data?.access_token || state.token;
        console.log(payload);
        localStorage.setItem('access_token', payload.data?.access_token || state.token);
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
        // Token is invalid/expired — clear auth so ProtectedRoute redirects
        state.token = null;
        state.user = null;
        localStorage.removeItem('access_token');
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

export const { clearError, clearMessage, setToken, resetAuth } = authSlice.actions;
export default authSlice.reducer;
