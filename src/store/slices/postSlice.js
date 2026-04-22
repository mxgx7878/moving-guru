import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  fetchAnnouncements,
  fetchAnnouncementDetail,
} from '../actions/postAction';

const initialState = {
  // Admin moderation
  posts: [],
  pagination: null,
  status: STATUS.IDLE,
  mutating: STATUS.IDLE,
  message: null,
  error: null,
  fieldErrors: null,

  // User-facing announcements
  announcements: [],
  selectedAnnouncement: null,
  announcementsStatus: STATUS.IDLE,
  announcementsPagination: null,
};

const replacePost = (state, updated) => {
  if (!updated) return;
  const idx = state.posts.findIndex((p) => p.id === updated.id);
  if (idx !== -1) state.posts[idx] = updated;
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearPostError(state)   { state.error = null; },
    clearPostMessage(state) { state.message = null; },
    clearFieldErrors(state) { state.fieldErrors = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiData = payload?.data;
        state.posts = Array.isArray(apiData) ? apiData : [];
        state.pagination = payload?.meta || null;
      })
      .addCase(fetchPosts.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(createPost.pending, (state) => {
        state.mutating = STATUS.LOADING;
        state.fieldErrors = null;
      })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.mutating = STATUS.SUCCEEDED;
        state.fieldErrors = null;
        if (payload?.data) state.posts.unshift(payload.data);
        state.message = payload?.message || 'Post created.';
      })
      .addCase(createPost.rejected, (state, { payload }) => {
        state.mutating = STATUS.FAILED;
        state.error = payload?.message || 'Failed to create post.';
        state.fieldErrors = payload?.fieldErrors || null;
      })

      .addCase(updatePost.pending, (state) => {
        state.mutating = STATUS.LOADING;
        state.fieldErrors = null;
      })
      .addCase(updatePost.fulfilled, (state, { payload }) => {
        state.mutating = STATUS.SUCCEEDED;
        state.fieldErrors = null;
        replacePost(state, payload?.data);
        state.message = payload?.message || 'Post updated.';
      })
      .addCase(updatePost.rejected, (state, { payload }) => {
        state.mutating = STATUS.FAILED;
        state.error = payload?.message || 'Failed to update post.';
        state.fieldErrors = payload?.fieldErrors || null;
      })

      .addCase(deletePost.fulfilled, (state, { payload: id }) => {
        state.posts = state.posts.filter((p) => p.id !== id);
        state.message = 'Post deleted.';
      })
      .addCase(deletePost.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(publishPost.fulfilled, (state, { payload }) => {
        replacePost(state, payload?.data);
        state.message = payload?.message || 'Post published.';
      })
      .addCase(publishPost.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(unpublishPost.fulfilled, (state, { payload }) => {
        replacePost(state, payload?.data);
        state.message = payload?.message || 'Post unpublished.';
      })
      .addCase(unpublishPost.rejected, (state, { payload }) => { state.error = payload; })

      // ═══ User-facing announcements ═════════════════════════
      .addCase(fetchAnnouncements.pending, (state) => {
        state.announcementsStatus = STATUS.LOADING;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, { payload }) => {
        state.announcementsStatus = STATUS.SUCCEEDED;
        state.announcements = payload?.data?.posts || payload?.data || [];
        state.announcementsPagination = payload?.data?.meta || payload?.meta || null;
      })
      .addCase(fetchAnnouncements.rejected, (state, { payload }) => {
        state.announcementsStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAnnouncementDetail.fulfilled, (state, { payload }) => {
        state.selectedAnnouncement = payload?.data?.post || payload?.data || null;
      })
      .addCase(fetchAnnouncementDetail.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const {
  clearPostError,
  clearPostMessage,
  clearFieldErrors,
} = postSlice.actions;

export default postSlice.reducer;