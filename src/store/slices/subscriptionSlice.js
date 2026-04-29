import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  // User-facing
  fetchPlans,
  fetchCurrentSubscription,
  changePlan,
  // Admin
  fetchAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from '../actions/subscriptionAction';

const initialState = {
  // ── User-facing state ──
  plans: [],
  currentSubscription: null,
  status: STATUS.IDLE,
  error: null,
  message: null,

  // ── Admin state (kept under distinct keys to avoid clashing) ──
  adminPlans: [],
  adminPlansStatus: STATUS.IDLE,
  adminPlanMutating: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state)   { state.error   = null; },
    clearSubscriptionMessage(state) { state.message = null; },
  },
  extraReducers: (builder) => {
    // ─────────────────────────────────────────────────────────────
    //  USER-FACING
    // ─────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────
    //  ADMIN — fetch
    // ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchAdminPlans.pending, (state) => {
        state.adminPlansStatus = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchAdminPlans.fulfilled, (state, { payload }) => {
        state.adminPlansStatus = STATUS.SUCCEEDED;
        state.adminPlans = payload || [];
      })
      .addCase(fetchAdminPlans.rejected, (state, { payload }) => {
        state.adminPlansStatus = STATUS.FAILED;
        state.error = payload;
      });

    // ─────────────────────────────────────────────────────────────
    //  ADMIN — mutations (share a single `adminPlanMutating` flag)
    // ─────────────────────────────────────────────────────────────
    [createAdminPlan, updateAdminPlan, deleteAdminPlan].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.adminPlanMutating = true;
          state.error = null;
        })
        .addCase(thunk.rejected, (state, { payload }) => {
          state.adminPlanMutating = false;
          state.error = payload;
        });
    });

    builder
      .addCase(createAdminPlan.fulfilled, (state, { payload }) => {
        state.adminPlanMutating = false;
        state.message = payload.message || 'Plan created';
        const plan = payload.data?.plan;
        if (plan) state.adminPlans = [...state.adminPlans, plan];
      })

      .addCase(updateAdminPlan.fulfilled, (state, { payload }) => {
        state.adminPlanMutating = false;
        state.message = payload.message || 'Plan updated';
        const updated = payload.data?.plan;
        if (updated) {
          state.adminPlans = state.adminPlans.map((p) =>
            p.id === updated.id ? { ...p, ...updated } : p,
          );
        }
      })

      .addCase(deleteAdminPlan.fulfilled, (state, { payload }) => {
        state.adminPlanMutating = false;
        state.message = payload.softDelete ? 'Plan archived' : 'Plan deleted';
        if (payload.softDelete && payload.plan) {
          state.adminPlans = state.adminPlans.map((p) =>
            p.id === payload.id ? { ...p, ...payload.plan } : p,
          );
        } else {
          state.adminPlans = state.adminPlans.filter((p) => p.id !== payload.id);
        }
      });
  },
});

export const {
  clearSubscriptionError,
  clearSubscriptionMessage,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;