import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { GROW_POSTS } from '../../data/growData';
import {
  fetchGrowPosts,
  fetchMyGrowPosts,
  createGrowPost,
  updateGrowPost,
  deleteGrowPost,
} from '../actions/grow';

const initialState = {
  posts: GROW_POSTS,        // fallback to static dummy data until API responds
  myPosts: [],
  pagination: null,
  status: STATUS.IDLE,
  submitStatus: STATUS.IDLE,
  error: null,
  submitError: null,
  message: null,
};

const growSlice = createSlice({
  name: 'grow',
  initialState,
  reducers: {
    clearGrowError(state) {
      state.error = null;
      state.submitError = null;
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
        // Only replace dummy data if the API actually returned records
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
          // Add to myPosts immediately
          state.myPosts.unshift(newPost);
          // If it's already approved (unlikely but handle it), add to public feed
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
        const updated = payload.data;
        if (updated) {
          // Update in myPosts
          const myIdx = state.myPosts.findIndex((p) => p.id === updated.id);
          if (myIdx !== -1) state.myPosts[myIdx] = updated;

          // Update in public feed
          const idx = state.posts.findIndex((p) => p.id === updated.id);
          if (idx !== -1) state.posts[idx] = updated;
        }
        state.message = payload.message || 'Post updated successfully.';
      })
      .addCase(updateGrowPost.rejected, (state, { payload }) => {
        state.submitStatus = STATUS.FAILED;
        state.submitError = payload;
      })

      // ── Delete post ──────────────────────────────────────────
      .addCase(deleteGrowPost.fulfilled, (state, { payload: id }) => {
        state.myPosts = state.myPosts.filter((p) => p.id !== id);
        state.posts   = state.posts.filter((p) => p.id !== id);
        state.message = 'Post deleted.';
      })
      .addCase(deleteGrowPost.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { clearGrowError, clearGrowMessage, resetSubmitStatus } = growSlice.actions;
export default growSlice.reducer;