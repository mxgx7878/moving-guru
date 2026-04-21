import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchPlans,
  fetchCurrentSubscription,
  changePlan,
} from '../actions/subscriptionAction';

const initialState = {
  plans: [],
  currentSubscription: null,
  status: STATUS.IDLE,
  error: null,
  message: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state) {
      state.error = null;
    },
    clearSubscriptionMessage(state) {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiPlans = payload.data?.plans || payload.data;
        state.plans = Array.isArray(apiPlans) ? apiPlans : [];
      })
      .addCase(fetchPlans.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchCurrentSubscription.fulfilled, (state, { payload }) => {
        state.currentSubscription = payload.data?.subscription || payload.data || null;
      })

      .addCase(changePlan.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(changePlan.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.message = payload.message || 'Plan updated successfully';
        state.currentSubscription = payload.data?.subscription || state.currentSubscription;
      })
      .addCase(changePlan.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const { clearSubscriptionError, clearSubscriptionMessage } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
