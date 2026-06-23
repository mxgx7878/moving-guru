import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

// ── Admin ──────────────────────────────────────────────────────
export const fetchPromoCodes = createAsyncThunk(
  'promo/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_PROMO_CODES);
      return data.data?.promoCodes || [];
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const createPromoCode = createAsyncThunk(
  'promo/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_PROMO_CODES, payload);
      return data;
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const togglePromoCode = createAsyncThunk(
  'promo/toggle',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_PROMO_CODE_DETAIL}/${id}`,
        { isActive },
      );
      return data;
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const deletePromoCode = createAsyncThunk(
  'promo/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_PROMO_CODE_DETAIL}/${id}`);
      return { id, softDelete: data.data?.softDelete, promoCode: data.data?.promoCode };
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

// ── User ───────────────────────────────────────────────────────
export const validatePromoCode = createAsyncThunk(
  'promo/validate',
  async ({ code, planId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.PROMO_VALIDATE, { code, planId });
      return data.data; // { code, discountType, discountValue, duration, preview? }
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);