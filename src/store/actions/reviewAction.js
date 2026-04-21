import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

/**
 * GET /users/:id/reviews?direction=...
 * Public — fetches reviews about a single user plus summary stats.
 * Returns { userId, direction, payload } so the slice can bucket results
 * by userId without relying on request ordering.
 */
export const fetchUserReviews = createAsyncThunk(
  'review/fetchForUser',
  async ({ userId, direction }, { rejectWithValue }) => {
    try {
      const params = direction ? { direction } : {};
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.USER_REVIEWS}/${userId}/reviews`,
        { params },
      );
      return { userId, direction, payload: data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createReview = createAsyncThunk(
  'review/create',
  async ({ revieweeId, rating, comment, jobListingId }, { rejectWithValue }) => {
    try {
      const body = {
        reviewee_id: revieweeId,
        rating,
        comment: comment || null,
        job_listing_id: jobListingId || null,
      };
      const { data } = await axiosInstance.post(API_ENDPOINTS.REVIEWS, body);
      return { revieweeId, payload: data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.REVIEWS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMyReviews = createAsyncThunk(
  'review/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.REVIEWS_MINE);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchEligibleReviews = createAsyncThunk(
  'review/fetchEligible',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.REVIEWS_ELIGIBLE);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);