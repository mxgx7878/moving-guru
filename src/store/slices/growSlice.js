import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { GROW_POSTS } from '../../data/growData';
import {
  fetchGrowPosts,
  fetchMyGrowPosts,
  createGrowPost,
  updateGrowPost,
  deleteGrowPost,
  fetchAdminGrowPosts,
  approveGrowPost,
  rejectGrowPost,
  boostGrowPost,
  adminDeleteGrowPost,
} from '../actions/grow';

const initialState = {
  posts: GROW_POSTS,        // fallback to static dummy data until API responds
  myPosts: [],
  adminPosts: [],
  pagination: null,
  adminPagination: null,
  status: STATUS.IDLE,
  adminStatus: STATUS.IDLE,
  submitStatus: STATUS.IDLE,
  moderationStatus: STATUS.IDLE,
  error: null,
  submitError: null,
  adminError: null,
  message: null,
};

// Helper: replace a post everywhere it appears in state
const replacePost = (state, updated) => {
  if (!updated) return;
  const tryReplace = (arr) => {
    const idx = arr.findIndex((p) => p.id === updated.id);
    if (idx !== -1) arr[idx] = updated;
  };
  tryReplace(state.myPosts);
  tryReplace(state.posts);
  tryReplace(state.adminPosts);
};

const growSlice = createSlice({
  name: 'grow',
  initialState,
  reducers: {
    clearGrowError(state) {
      state.error = null;
      state.submitError = null;
      state.adminError = null;
    },
    clearGrowMessage(state) {
      state.message = null;
    },
    resetSubmitStatus(state) {
      state.submitStatus = STATUS.IDLE;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Fetch all posts ──────────────────────────────────────
      .addCase(fetchGrowPosts.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchGrowPosts.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiPosts = payload.data;
        if (Array.isArray(apiPosts) && apiPosts.length > 0) {
          state.posts = apiPosts;
        }
        state.pagination = payload.meta || null;
      })
      .addCase(fetchGrowPosts.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy data — no error shown to user for browse failure
      })

      // ── Fetch my own posts ───────────────────────────────────
      .addCase(fetchMyGrowPosts.fulfilled, (state, { payload }) => {
        state.myPosts = payload.data || [];
      })
      .addCase(fetchMyGrowPosts.rejected, (state) => {
        state.myPosts = [];
      })

      // ── Create post ──────────────────────────────────────────
      .addCase(createGrowPost.pending, (state) => {
        state.submitStatus = STATUS.LOADING;
        state.submitError = null;
      })
      .addCase(createGrowPost.fulfilled, (state, { payload }) => {
        state.submitStatus = STATUS.SUCCEEDED;
        const newPost = payload.data;
        if (newPost) {
          state.myPosts.unshift(newPost);
          if (newPost.status === 'approved') {
            state.posts.unshift(newPost);
          }
        }
        state.message = payload.message || 'Post submitted successfully! Pending approval.';
      })
      .addCase(createGrowPost.rejected, (state, { payload }) => {
        state.submitStatus = STATUS.FAILED;
        state.submitError = payload;
      })

      // ── Update post ──────────────────────────────────────────
      .addCase(updateGrowPost.pending, (state) => {
        state.submitStatus = STATUS.LOADING;
        state.submitError = null;
      })
      .addCase(updateGrowPost.fulfilled, (state, { payload }) => {
        state.submitStatus = STATUS.SUCCEEDED;
        replacePost(state, payload.data);
        state.message = payload.message || 'Post updated successfully.';
      })
      .addCase(updateGrowPost.rejected, (state, { payload }) => {
        state.submitStatus = STATUS.FAILED;
        state.submitError = payload;
      })

      // ── Delete post (owner) ──────────────────────────────────
      .addCase(deleteGrowPost.fulfilled, (state, { payload: id }) => {
        state.myPosts    = state.myPosts.filter((p) => p.id !== id);
        state.posts      = state.posts.filter((p) => p.id !== id);
        state.adminPosts = state.adminPosts.filter((p) => p.id !== id);
        state.message    = 'Post deleted.';
      })
      .addCase(deleteGrowPost.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // ═══════════════════════════════════════════════════════
      //  Admin
      // ═══════════════════════════════════════════════════════

      // ── Admin: list all posts ────────────────────────────────
      .addCase(fetchAdminGrowPosts.pending, (state) => {
        state.adminStatus = STATUS.LOADING;
        state.adminError = null;
      })
      .addCase(fetchAdminGrowPosts.fulfilled, (state, { payload }) => {
        state.adminStatus = STATUS.SUCCEEDED;
        state.adminPosts = payload.data || [];
        state.adminPagination = payload.meta || null;
      })
      .addCase(fetchAdminGrowPosts.rejected, (state, { payload }) => {
        state.adminStatus = STATUS.FAILED;
        state.adminError = payload;
      })

      // ── Admin: approve ───────────────────────────────────────
      .addCase(approveGrowPost.pending, (state) => {
        state.moderationStatus = STATUS.LOADING;
      })
      .addCase(approveGrowPost.fulfilled, (state, { payload }) => {
        state.moderationStatus = STATUS.SUCCEEDED;
        replacePost(state, payload.data);
        state.message = payload.message || 'Post approved.';
      })
      .addCase(approveGrowPost.rejected, (state, { payload }) => {
        state.moderationStatus = STATUS.FAILED;
        state.adminError = payload;
      })

      // ── Admin: reject ────────────────────────────────────────
      .addCase(rejectGrowPost.pending, (state) => {
        state.moderationStatus = STATUS.LOADING;
      })
      .addCase(rejectGrowPost.fulfilled, (state, { payload }) => {
        state.moderationStatus = STATUS.SUCCEEDED;
        replacePost(state, payload.data);
        state.message = payload.message || 'Post rejected.';
      })
      .addCase(rejectGrowPost.rejected, (state, { payload }) => {
        state.moderationStatus = STATUS.FAILED;
        state.adminError = payload;
      })

      // ── Admin: boost / feature ───────────────────────────────
      .addCase(boostGrowPost.fulfilled, (state, { payload }) => {
        replacePost(state, payload.data);
        state.message = payload.message || 'Post updated.';
      })
      .addCase(boostGrowPost.rejected, (state, { payload }) => {
        state.adminError = payload;
      })

      // ── Admin: delete any post ───────────────────────────────
      .addCase(adminDeleteGrowPost.fulfilled, (state, { payload: id }) => {
        state.adminPosts = state.adminPosts.filter((p) => p.id !== id);
        state.posts      = state.posts.filter((p) => p.id !== id);
        state.myPosts    = state.myPosts.filter((p) => p.id !== id);
        state.message    = 'Post deleted.';
      })
      .addCase(adminDeleteGrowPost.rejected, (state, { payload }) => {
        state.adminError = payload;
      });
  },
});

export const { clearGrowError, clearGrowMessage, resetSubmitStatus } = growSlice.actions;
export default growSlice.reducer;
