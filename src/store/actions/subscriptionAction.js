import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

// ═══════════════════════════════════════════════════════════════════
//  USER-FACING — plans + subscription
// ═══════════════════════════════════════════════════════════════════

export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.PLANS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.CURRENT_SUBSCRIPTION);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.CHANGE_PLAN, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createSetupIntent = createAsyncThunk(
  'subscription/createSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.SETUP_INTENT);
      return data.data; // { clientSecret, customerId }
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const attachPaymentMethod = createAsyncThunk(
  'subscription/attachPaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        API_ENDPOINTS.ATTACH_PAYMENT_METHOD,
        { paymentMethodId },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const resumeSubscription = createAsyncThunk(
  'subscription/resume',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.RESUME_SUBSCRIPTION);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ═══════════════════════════════════════════════════════════════════
//  ADMIN — plan catalog management (Stripe-synced)
// ═══════════════════════════════════════════════════════════════════

export const fetchAdminPlans = createAsyncThunk(
  'subscription/fetchAdminPlans',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_PLANS);
      return data.data?.plans || [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createAdminPlan = createAsyncThunk(
  'subscription/createAdminPlan',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_PLANS, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateAdminPlan = createAsyncThunk(
  'subscription/updateAdminPlan',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_PLAN_DETAIL}/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteAdminPlan = createAsyncThunk(
  'subscription/deleteAdminPlan',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_PLAN_DETAIL}/${id}`);
      return { id, softDelete: data.data?.softDelete, plan: data.data?.plan };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);