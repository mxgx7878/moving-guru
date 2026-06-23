import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchPromoCodes, createPromoCode, togglePromoCode, deletePromoCode,
} from '../actions/promoCodeAction';

const initialState = {
  promoCodes: [],
  status:     STATUS.IDLE,
  mutating:   false,
  error:      null,
  message:    null,
};

const promoCodeSlice = createSlice({
  name: 'promo',
  initialState,
  reducers: {
    clearPromoError(s)   { s.error = null; },
    clearPromoMessage(s) { s.message = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchPromoCodes.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
     .addCase(fetchPromoCodes.fulfilled, (s, { payload }) => { s.status = STATUS.SUCCEEDED; s.promoCodes = payload || []; })
     .addCase(fetchPromoCodes.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    b.addCase(createPromoCode.pending,   (s) => { s.mutating = true; s.error = null; })
     .addCase(createPromoCode.fulfilled, (s, { payload }) => {
        s.mutating = false;
        s.message  = payload.message || 'Promo code created';
        const pc = payload.data?.promoCode;
        if (pc) s.promoCodes = [pc, ...s.promoCodes];
      })
     .addCase(createPromoCode.rejected,  (s, { payload }) => { s.mutating = false; s.error = payload; });

    b.addCase(togglePromoCode.fulfilled, (s, { payload }) => {
        s.message = payload.message || 'Promo code updated';
        const pc = payload.data?.promoCode;
        if (pc) s.promoCodes = s.promoCodes.map((x) => (x.id === pc.id ? { ...x, ...pc } : x));
      })
     .addCase(togglePromoCode.rejected,  (s, { payload }) => { s.error = payload; });

    b.addCase(deletePromoCode.fulfilled, (s, { payload }) => {
        s.message = payload.softDelete ? 'Promo code archived' : 'Promo code deleted';
        if (payload.softDelete && payload.promoCode) {
          s.promoCodes = s.promoCodes.map((x) => (x.id === payload.id ? { ...x, ...payload.promoCode } : x));
        } else {
          s.promoCodes = s.promoCodes.filter((x) => x.id !== payload.id);
        }
      })
     .addCase(deletePromoCode.rejected,  (s, { payload }) => { s.error = payload; });
  },
});

export const { clearPromoError, clearPromoMessage } = promoCodeSlice.actions;
export default promoCodeSlice.reducer;