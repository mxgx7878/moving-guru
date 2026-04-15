import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchAdminDashboardStats,
  fetchAdminDashboardActivity,
  fetchAdminUsers,
  fetchAdminUserDetail,
  updateAdminUser,
  suspendAdminUser,
  activateAdminUser,
  verifyAdminUser,
  deleteAdminUser,
  fetchAdminPosts,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
  publishAdminPost,
  unpublishAdminPost,
} from '../actions/admin';

const initialState = {
  // Dashboard
  stats: null,
  activity: null,
  statsStatus:    STATUS.IDLE,
  activityStatus: STATUS.IDLE,

  // Users
  users: [],
  userDetail: null,
  usersPagination: null,
  usersStatus:  STATUS.IDLE,
  userMutating: STATUS.IDLE,

  // Platform posts/events
  posts: [],
  postsPagination: null,
  postsStatus:  STATUS.IDLE,
  postMutating: STATUS.IDLE,

  // Cross-cutting
  message: null,
  error: null,
};

// Replace a user in the users array (in place)
const replaceUser = (state, updated) => {
  if (!updated) return;
  const idx = state.users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) state.users[idx] = updated;
  if (state.userDetail?.id === updated.id) state.userDetail = updated;
};

const replacePost = (state, updated) => {
  if (!updated) return;
  const idx = state.posts.findIndex((p) => p.id === updated.id);
  if (idx !== -1) state.posts[idx] = updated;
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    clearAdminMessage(state) {
      state.message = null;
    },
    clearUserDetail(state) {
      state.userDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Dashboard stats ──────────────────────────────────────
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.statsStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, { payload }) => {
        state.statsStatus = STATUS.SUCCEEDED;
        state.stats = payload.data || null;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, { payload }) => {
        state.statsStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ── Dashboard activity ───────────────────────────────────
      .addCase(fetchAdminDashboardActivity.pending, (state) => {
        state.activityStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminDashboardActivity.fulfilled, (state, { payload }) => {
        state.activityStatus = STATUS.SUCCEEDED;
        state.activity = payload.data || null;
      })
      .addCase(fetchAdminDashboardActivity.rejected, (state, { payload }) => {
        state.activityStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ═══════════════════════════════════════════════════════
      //  Users
      // ═══════════════════════════════════════════════════════
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.usersStatus = STATUS.SUCCEEDED;
        state.users = payload.data || [];
        state.usersPagination = payload.meta || null;
      })
      .addCase(fetchAdminUsers.rejected, (state, { payload }) => {
        state.usersStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminUserDetail.fulfilled, (state, { payload }) => {
        state.userDetail = payload.data || null;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.userMutating = STATUS.LOADING;
      })
      .addCase(updateAdminUser.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        replaceUser(state, payload.data);
        state.message = payload.message || 'User updated.';
      })
      .addCase(updateAdminUser.rejected, (state, { payload }) => {
        state.userMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(suspendAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload.data);
        state.message = payload.message || 'User suspended.';
      })
      .addCase(suspendAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(activateAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload.data);
        state.message = payload.message || 'User activated.';
      })
      .addCase(activateAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(verifyAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload.data);
        state.message = payload.message || 'Verification updated.';
      })
      .addCase(verifyAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(deleteAdminUser.fulfilled, (state, { payload: id }) => {
        state.users = state.users.filter((u) => u.id !== id);
        if (state.userDetail?.id === id) state.userDetail = null;
        state.message = 'User deleted.';
      })
      .addCase(deleteAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // ═══════════════════════════════════════════════════════
      //  Posts / Events
      // ═══════════════════════════════════════════════════════
      .addCase(fetchAdminPosts.pending, (state) => {
        state.postsStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminPosts.fulfilled, (state, { payload }) => {
        state.postsStatus = STATUS.SUCCEEDED;
        state.posts = payload.data || [];
        state.postsPagination = payload.meta || null;
      })
      .addCase(fetchAdminPosts.rejected, (state, { payload }) => {
        state.postsStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(createAdminPost.pending, (state) => {
        state.postMutating = STATUS.LOADING;
      })
      .addCase(createAdminPost.fulfilled, (state, { payload }) => {
        state.postMutating = STATUS.SUCCEEDED;
        if (payload.data) state.posts.unshift(payload.data);
        state.message = payload.message || 'Post created.';
      })
      .addCase(createAdminPost.rejected, (state, { payload }) => {
        state.postMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(updateAdminPost.pending, (state) => {
        state.postMutating = STATUS.LOADING;
      })
      .addCase(updateAdminPost.fulfilled, (state, { payload }) => {
        state.postMutating = STATUS.SUCCEEDED;
        replacePost(state, payload.data);
        state.message = payload.message || 'Post updated.';
      })
      .addCase(updateAdminPost.rejected, (state, { payload }) => {
        state.postMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(deleteAdminPost.fulfilled, (state, { payload: id }) => {
        state.posts = state.posts.filter((p) => p.id !== id);
        state.message = 'Post deleted.';
      })
      .addCase(deleteAdminPost.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(publishAdminPost.fulfilled, (state, { payload }) => {
        replacePost(state, payload.data);
        state.message = payload.message || 'Post published.';
      })
      .addCase(publishAdminPost.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(unpublishAdminPost.fulfilled, (state, { payload }) => {
        replacePost(state, payload.data);
        state.message = payload.message || 'Post unpublished.';
      })
      .addCase(unpublishAdminPost.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { clearAdminError, clearAdminMessage, clearUserDetail } = adminSlice.actions;
export default adminSlice.reducer;
