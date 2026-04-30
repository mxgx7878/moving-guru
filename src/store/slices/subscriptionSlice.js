import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  // User-facing
  fetchPlans,
  fetchCurrentSubscription,
  changePlan,
  cancelSubscription,
  resumeSubscription,
  // Admin — plans
  fetchAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  syncAdminPlansFromStripe,
  // Admin — features
  fetchAllFeatures,
  fetchPlanFeatures,
  updatePlanFeatures,
} from '../actions/subscriptionAction';

const initialState = {
  plans:               [],
  currentSubscription: null,
  allowedFeatures:     [],
  status:              STATUS.IDLE,
  error:               null,
  message:             null,

  adminPlans:           [],
  adminPlansStatus:     STATUS.IDLE,
  adminPlanMutating:    false,
  adminSyncing:         false,

  allFeatures:          [],
  planFeatureIdsMap:    {},
  planFeaturesMutating: false,
};

// Helper to extract subscription from cancel/resume response and merge it
// into state. Both endpoints return { subscription: {...} } in data.
const applySubscriptionPayload = (state, payload) => {
  state.message = payload.message || state.message;
  const sub = payload.data?.subscription;
  if (sub) {
    state.currentSubscription = sub;
    state.allowedFeatures = Array.isArray(sub?.plan?.featureKeys)
      ? sub.plan.featureKeys
      : state.allowedFeatures;
  }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError(state)   { state.error   = null; },
    clearSubscriptionMessage(state) { state.message = null; },
  },
  extraReducers: (builder) => {

    // fetchPlans
    builder
      .addCase(fetchPlans.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
      .addCase(fetchPlans.fulfilled, (s, { payload }) => {
        s.status = STATUS.SUCCEEDED;
        const api = payload.data?.plans || payload.data;
        s.plans = Array.isArray(api) ? api : [];
      })
      .addCase(fetchPlans.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    // fetchCurrentSubscription — populate allowedFeatures
    builder.addCase(fetchCurrentSubscription.fulfilled, (s, { payload }) => {
      const sub = payload.data?.subscription || payload.data || null;
      s.currentSubscription = sub;
      s.allowedFeatures = Array.isArray(sub?.plan?.featureKeys) ? sub.plan.featureKeys : [];
    });

    // changePlan
    builder
      .addCase(changePlan.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
      .addCase(changePlan.fulfilled, (s, { payload }) => {
        s.status = STATUS.SUCCEEDED;
        applySubscriptionPayload(s, payload);
        s.message = payload.message || 'Plan updated successfully';
      })
      .addCase(changePlan.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    // ── Cancel subscription ─────────────────────────────────────
    builder
      .addCase(cancelSubscription.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
      .addCase(cancelSubscription.fulfilled, (s, { payload }) => {
        s.status = STATUS.SUCCEEDED;
        applySubscriptionPayload(s, payload);
        s.message = payload.message || 'Subscription will cancel at period end';
      })
      .addCase(cancelSubscription.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    // ── Resume subscription ─────────────────────────────────────
    builder
      .addCase(resumeSubscription.pending,   (s) => { s.status = STATUS.LOADING; s.error = null; })
      .addCase(resumeSubscription.fulfilled, (s, { payload }) => {
        s.status = STATUS.SUCCEEDED;
        applySubscriptionPayload(s, payload);
        s.message = payload.message || 'Subscription resumed';
      })
      .addCase(resumeSubscription.rejected,  (s, { payload }) => { s.status = STATUS.FAILED; s.error = payload; });

    // Admin: plans
    builder
      .addCase(fetchAdminPlans.pending,   (s) => { s.adminPlansStatus = STATUS.LOADING; s.error = null; })
      .addCase(fetchAdminPlans.fulfilled, (s, { payload }) => {
        s.adminPlansStatus = STATUS.SUCCEEDED;
        s.adminPlans = payload || [];
      })
      .addCase(fetchAdminPlans.rejected,  (s, { payload }) => { s.adminPlansStatus = STATUS.FAILED; s.error = payload; });

    [createAdminPlan, updateAdminPlan, deleteAdminPlan].forEach((thunk) => {
      builder
        .addCase(thunk.pending,  (s) => { s.adminPlanMutating = true; s.error = null; })
        .addCase(thunk.rejected, (s, { payload }) => { s.adminPlanMutating = false; s.error = payload; });
    });

    builder
      .addCase(createAdminPlan.fulfilled, (s, { payload }) => {
        s.adminPlanMutating = false;
        s.message = payload.message || 'Plan created';
        const p = payload.data?.plan;
        if (p) s.adminPlans = [...s.adminPlans, p];
      })
      .addCase(updateAdminPlan.fulfilled, (s, { payload }) => {
        s.adminPlanMutating = false;
        s.message = payload.message || 'Plan updated';
        const u = payload.data?.plan;
        if (u) s.adminPlans = s.adminPlans.map((p) => (p.id === u.id ? { ...p, ...u } : p));
      })
      .addCase(deleteAdminPlan.fulfilled, (s, { payload }) => {
        s.adminPlanMutating = false;
        s.message = payload.softDelete ? 'Plan archived' : 'Plan deleted';
        if (payload.softDelete && payload.plan) {
          s.adminPlans = s.adminPlans.map((p) => (p.id === payload.id ? { ...p, ...payload.plan } : p));
        } else {
          s.adminPlans = s.adminPlans.filter((p) => p.id !== payload.id);
        }
      });

    // Admin: sync from Stripe
    if (syncAdminPlansFromStripe) {
      builder
        .addCase(syncAdminPlansFromStripe.pending,   (s) => { s.adminSyncing = true; s.error = null; })
        .addCase(syncAdminPlansFromStripe.fulfilled, (s, { payload }) => {
          s.adminSyncing = false;
          s.message = payload?.message || 'Synced from Stripe';
        })
        .addCase(syncAdminPlansFromStripe.rejected,  (s, { payload }) => { s.adminSyncing = false; s.error = payload; });
    }

    // Admin: features
    if (fetchAllFeatures) {
      builder.addCase(fetchAllFeatures.fulfilled, (s, { payload }) => {
        s.allFeatures = payload || [];
      });
    }
    if (fetchPlanFeatures) {
      builder.addCase(fetchPlanFeatures.fulfilled, (s, { payload }) => {
        s.planFeatureIdsMap[payload.planId] = payload.featureIds;
      });
    }
    if (updatePlanFeatures) {
      builder
        .addCase(updatePlanFeatures.pending,   (s) => { s.planFeaturesMutating = true; s.error = null; })
        .addCase(updatePlanFeatures.fulfilled, (s, { payload }) => {
          s.planFeaturesMutating = false;
          s.message = payload.message || 'Features updated';
          s.planFeatureIdsMap[payload.planId] = payload.featureIds;
          s.adminPlans = s.adminPlans.map((p) =>
            p.id === payload.planId ? { ...p, featureKeys: payload.featureKeys } : p
          );
        })
        .addCase(updatePlanFeatures.rejected, (s, { payload }) => {
          s.planFeaturesMutating = false;
          s.error = payload;
        });
    }
  },
});

export const { clearSubscriptionError, clearSubscriptionMessage } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;