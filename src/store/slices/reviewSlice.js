import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchUserReviews,
  createReview,
  deleteReview,
  fetchMyReviews,
  fetchEligibleReviews,
  fetchAdminReviews, adminDeleteReview
} from '../actions/reviewAction';

/**
 * Review slice
 * -----------------------------------------------------------------
 * State shape:
 *   byUserId: {
 *     [userId]: { reviews: [], summary: {...}, status }
 *   }
 *   myReviews: reviews I have written (array)
 *   eligible: counterparties I can still review (array)
 *
 * We key review lists by userId so we can cache per-profile without a
 * cross-contamination bug when a studio opens the applicant modal,
 * closes it, and opens a different instructor.
 */

const initialState = {
  byUserId: {},
  myReviews: [],
  eligible: [],

  myReviewsStatus: STATUS.IDLE,
  eligibleStatus:  STATUS.IDLE,

  submitting: false,
  deletingId: null,

  error: null,
  message: null,

  adminReviews:        [],
  adminReviewsStatus:  STATUS.IDLE,
  adminReviewsMeta:    { page: 1, per_page: 15, total: 0, last_page: 1 },
  adminDeletingId:     null,
};

const unwrapList = (payload, key) => {
  const d = payload?.data;
  if (Array.isArray(d?.[key])) return d[key];
  if (Array.isArray(d))        return d;
  return [];
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError(state)   { state.error = null; },
    clearReviewMessage(state) { state.message = null; },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch reviews for a user ───────────────────────────
      .addCase(fetchUserReviews.pending, (state, { meta }) => {
        const { userId } = meta.arg;
        state.byUserId[userId] = {
          ...(state.byUserId[userId] || { reviews: [], summary: null }),
          status: STATUS.LOADING,
        };
      })
      .addCase(fetchUserReviews.fulfilled, (state, { payload }) => {
        const { userId, payload: resp } = payload;
        state.byUserId[userId] = {
          reviews: resp?.data?.reviews || [],
          summary: resp?.data?.summary || { count: 0, average: 0, distribution: {} },
          status: STATUS.SUCCEEDED,
        };
      })
      .addCase(fetchUserReviews.rejected, (state, { meta, payload }) => {
        const { userId } = meta.arg;
        state.byUserId[userId] = {
          ...(state.byUserId[userId] || { reviews: [], summary: null }),
          status: STATUS.FAILED,
        };
        state.error = payload;
      })

      // ── Create review ──────────────────────────────────────
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, { payload }) => {
        state.submitting = false;
        const { revieweeId, payload: resp } = payload;
        const newReview = resp?.data?.review;
        if (newReview) {
          // Prepend into cached list for the reviewee if we have one
          const bucket = state.byUserId[revieweeId];
          if (bucket) {
            bucket.reviews = [newReview, ...bucket.reviews];
            // Recompute summary locally so UI updates immediately
            const count = bucket.reviews.length;
            const avg = count > 0
              ? Math.round((bucket.reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
              : 0;
            const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            bucket.reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
            bucket.summary = { count, average: avg, distribution: dist };
          }
          state.myReviews.unshift(newReview);
          // Drop from eligible list — they just fulfilled it
          state.eligible = state.eligible.filter(
            (e) => !(
              e.counterparty?.id === revieweeId &&
              e.job_listing_id === newReview.job_listing_id
            ),
          );
        }
        state.message = resp?.message || 'Review posted';
      })
      .addCase(createReview.rejected, (state, { payload }) => {
        state.submitting = false;
        state.error = payload;
      })

      // ── Delete review ──────────────────────────────────────
      .addCase(deleteReview.pending, (state, { meta }) => {
        state.deletingId = meta.arg;
      })
      .addCase(deleteReview.fulfilled, (state, { payload: id }) => {
        state.deletingId = null;
        // Remove from myReviews
        state.myReviews = state.myReviews.filter((r) => r.id !== id);
        // Remove from any cached reviewee bucket
        Object.keys(state.byUserId).forEach((uid) => {
          const b = state.byUserId[uid];
          if (!b) return;
          const before = b.reviews.length;
          b.reviews = b.reviews.filter((r) => r.id !== id);
          if (b.reviews.length !== before) {
            const count = b.reviews.length;
            const avg = count > 0
              ? Math.round((b.reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
              : 0;
            b.summary = { ...(b.summary || {}), count, average: avg };
          }
        });
        state.message = 'Review deleted';
      })
      .addCase(deleteReview.rejected, (state, { payload }) => {
        state.deletingId = null;
        state.error = payload;
      })

      // ── My reviews ─────────────────────────────────────────
      .addCase(fetchMyReviews.pending, (state) => {
        state.myReviewsStatus = STATUS.LOADING;
      })
      .addCase(fetchMyReviews.fulfilled, (state, { payload }) => {
        state.myReviewsStatus = STATUS.SUCCEEDED;
        state.myReviews = unwrapList(payload, 'reviews');
      })
      .addCase(fetchMyReviews.rejected, (state, { payload }) => {
        state.myReviewsStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ── Eligible reviews ───────────────────────────────────
      .addCase(fetchEligibleReviews.pending, (state) => {
        state.eligibleStatus = STATUS.LOADING;
      })
      .addCase(fetchEligibleReviews.fulfilled, (state, { payload }) => {
        state.eligibleStatus = STATUS.SUCCEEDED;
        state.eligible = unwrapList(payload, 'eligible');
      })
      .addCase(fetchEligibleReviews.rejected, (state, { payload }) => {
        state.eligibleStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ── Admin reviews ─────────────────────────────────────
      .addCase(fetchAdminReviews.pending, (state) => {
        state.adminReviewsStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, { payload }) => {
        state.adminReviewsStatus = STATUS.SUCCEEDED;
        state.adminReviews = unwrapList(payload, 'reviews');
        state.adminReviewsMeta = payload?.meta || state.adminReviewsMeta;
      })
      .addCase(fetchAdminReviews.rejected, (state, { payload }) => {
        state.adminReviewsStatus = STATUS.FAILED;
        state.error = payload;
      })
      .addCase(adminDeleteReview.pending, (state, { meta }) => {
        state.adminDeletingId = meta.arg.id;
      })
      .addCase(adminDeleteReview.fulfilled, (state, { payload: id }) => {
        state.adminDeletingId = null;
        state.adminReviews = state.adminReviews.filter((r) => r.id !== id);
        state.message = 'Review removed';
      })
      .addCase(adminDeleteReview.rejected, (state, { payload }) => {
        state.adminDeletingId = null;
        state.error = payload;
      })
  },
});

export const { clearReviewError, clearReviewMessage } = reviewSlice.actions;
export default reviewSlice.reducer;