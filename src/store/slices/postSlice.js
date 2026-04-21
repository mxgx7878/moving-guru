import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from '../actions/postAction';

const initialState = {
  posts: [],
  pagination: null,
  status: STATUS.IDLE,
  mutating: STATUS.IDLE,
  message: null,
  error: null,
};

const replacePost = (state, updated) => {
  if (!updated) return;
  const idx = state.posts.findIndex((p) => p.id === updated.id);
  if (idx !== -1) state.posts[idx] = updated;
};

const newId = () => `post_${Date.now().toString(36)}`;

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearPostError(state)   { state.error   = null; },
    clearPostMessage(state) { state.message = null; },
    // Local-only mutations on dummy data (used while admin APIs are not ready)
    locallyCreatePost(state, { payload }) {
      state.posts.unshift({
        id: newId(),
        status: 'draft',
        published_at: null,
        created_at: new Date().toISOString(),
        ...payload,
      });
      state.message = 'Post created.';
    },
    locallyUpdatePost(state, { payload }) {
      replacePost(state, { ...payload, updated_at: new Date().toISOString() });
      state.message = 'Post updated.';
    },
    locallyDeletePost(state, { payload: id }) {
      state.posts = state.posts.filter((p) => p.id !== id);
      state.message = 'Post deleted.';
    },
    locallyTogglePublish(state, { payload: id }) {
      const idx = state.posts.findIndex((p) => p.id === id);
      if (idx === -1) return;
      const p = state.posts[idx];
      const isPublished = p.status === 'published';
      state.posts[idx] = {
        ...p,
        status: isPublished ? 'draft' : 'published',
        published_at: isPublished ? null : new Date().toISOString(),
      };
      state.message = isPublished ? 'Post unpublished.' : 'Post published.';
    },
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

      .addCase(createPost.pending,   (state) => { state.mutating = STATUS.LOADING; })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.mutating = STATUS.SUCCEEDED;
        if (payload?.data) state.posts.unshift(payload.data);
        state.message = payload?.message || 'Post created.';
      })
      .addCase(createPost.rejected,  (state, { payload }) => {
        state.mutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(updatePost.pending,   (state) => { state.mutating = STATUS.LOADING; })
      .addCase(updatePost.fulfilled, (state, { payload }) => {
        state.mutating = STATUS.SUCCEEDED;
        replacePost(state, payload?.data);
        state.message = payload?.message || 'Post updated.';
      })
      .addCase(updatePost.rejected,  (state, { payload }) => {
        state.mutating = STATUS.FAILED;
        state.error = payload;
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
      .addCase(unpublishPost.rejected, (state, { payload }) => { state.error = payload; });
  },
});

export const {
  clearPostError,
  clearPostMessage,
  locallyCreatePost,
  locallyUpdatePost,
  locallyDeletePost,
  locallyTogglePublish,
} = postSlice.actions;

export default postSlice.reducer;
