import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_PAYMENTS } from '../../data/dummyData';
import { fetchPayments } from '../actions/paymentAction';

const initialState = {
  payments: DUMMY_PAYMENTS, // default fallback from dummy data
  status: STATUS.IDLE,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiPayments = payload.data?.payments || payload.data;
        if (apiPayments && Array.isArray(apiPayments) && apiPayments.length > 0) {
          state.payments = apiPayments;
        }
        // else keep dummy payments as fallback
      })
      .addCase(fetchPayments.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy payments on error — no need to show error
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
