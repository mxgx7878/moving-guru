import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchGrowPromoCodes, createGrowPromoCode, toggleGrowPromoCode, deleteGrowPromoCode,
} from '../actions/growPromoAction';

const initialState = {
  promoCodes: [],
  status:     STATUS.IDLE,
  mutating:   false,
  error:      null,
  message:    null,
};

const growPromoSlice = createSlice({
  name: 'growPromo',
  initialState,
  reducers: {
    clearGrowPromoError(s)   { s.error = null; },
    clearGrowPromoMessage(s) { s.message = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchGrowPromoCodes.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
     .addCase(fetchGrowPromoCodes.fulfilled, (s, { payload }) => { s.status = STATUS.SUCCEEDED; s.promoCodes = payload || []; })
     .addCase(fetchGrowPromoCodes.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    b.addCase(createGrowPromoCode.pending,   (s) => { s.mutating = true; s.error = null; })
     .addCase(createGrowPromoCode.fulfilled, (s, { payload }) => {
        s.mutating = false;
        s.message  = payload.message || 'Grow promo code created';
        const pc = payload.data?.promoCode;
        if (pc) s.promoCodes = [pc, ...s.promoCodes];
      })
     .addCase(createGrowPromoCode.rejected,  (s, { payload }) => { s.mutating = false; s.error = payload; });

    b.addCase(toggleGrowPromoCode.fulfilled, (s, { payload }) => {
        s.message = payload.message || 'Grow promo code updated';
        const pc = payload.data?.promoCode;
        if (pc) s.promoCodes = s.promoCodes.map((x) => (x.id === pc.id ? { ...x, ...pc } : x));
      })
     .addCase(toggleGrowPromoCode.rejected,  (s, { payload }) => { s.error = payload; });

    b.addCase(deleteGrowPromoCode.fulfilled, (s, { payload }) => {
        s.message = payload.softDelete ? 'Grow promo code archived' : 'Grow promo code deleted';
        if (payload.softDelete && payload.promoCode) {
          s.promoCodes = s.promoCodes.map((x) => (x.id === payload.id ? { ...x, ...payload.promoCode } : x));
        } else {
          s.promoCodes = s.promoCodes.filter((x) => x.id !== payload.id);
        }
      })
     .addCase(deleteGrowPromoCode.rejected,  (s, { payload }) => { s.error = payload; });
  },
});

export const { clearGrowPromoError, clearGrowPromoMessage } = growPromoSlice.actions;
export default growPromoSlice.reducer;
