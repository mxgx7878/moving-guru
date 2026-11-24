import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { fetchPayments } from '../actions/paymentAction';

const initialState = {
  payments: [],
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
      .addCase(fetchPayments.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchPayments = meta.requestId;
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, { meta, payload }) => {
        if (state.requestIds?.fetchPayments !== meta.requestId) return;
        state.status = STATUS.SUCCEEDED;
        const apiPayments = payload.data?.payments || payload.data;
        state.payments = Array.isArray(apiPayments) ? apiPayments : [];
      })
      .addCase(fetchPayments.rejected, (state, { meta, payload }) => {
        if (state.requestIds?.fetchPayments !== meta.requestId) return;
        state.status = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
