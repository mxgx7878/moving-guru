import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

// ── Admin ──────────────────────────────────────────────────────
export const fetchGrowPromoCodes = createAsyncThunk(
  'growPromo/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_GROW_PROMO_CODES);
      return data.data?.promoCodes || [];
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const createGrowPromoCode = createAsyncThunk(
  'growPromo/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_GROW_PROMO_CODES, payload);
      return data;
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const toggleGrowPromoCode = createAsyncThunk(
  'growPromo/toggle',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_GROW_PROMO_CODE_DETAIL}/${id}`,
        { isActive },
      );
      return data;
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

export const deleteGrowPromoCode = createAsyncThunk(
  'growPromo/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_GROW_PROMO_CODE_DETAIL}/${id}`);
      return { id, softDelete: data.data?.softDelete, promoCode: data.data?.promoCode };
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);

// ── Public / checkout ──────────────────────────────────────────
// Validate a Grow promo code against a pricing tier and get a price preview.
export const validateGrowPromoCode = createAsyncThunk(
  'growPromo/validate',
  async ({ code, pricingTierId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.GROW_PROMO_VALIDATE, { code, pricingTierId });
      // { code, discountType, discountValue, originalAmount, discountAmount, finalAmount, currency }
      return data.data;
    } catch (e) { return rejectWithValue(getErrorMessage(e)); }
  },
);
