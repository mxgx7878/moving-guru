// src/features/billing/PlanFeaturesModal.jsx
//
// Admin modal — checklist of features for a single plan.
// Loads features dynamically from /api/admin/features (single source of truth — DB).
// Saves enabled feature IDs via PATCH /api/admin/plans/{id}/features.

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Modal, Button } from '../../components/ui';
import {
  fetchAllFeatures,
  fetchPlanFeatures,
  updatePlanFeatures,
} from '../../store/actions/subscriptionAction';
import {
  clearSubscriptionError,
  clearSubscriptionMessage,
} from '../../store/slices/subscriptionSlice';

const ROLE_LABELS = {
  instructor: 'Instructor features',
  studio:     'Studio features',
  both:       'Shared (both roles)',
};

export default function PlanFeaturesModal({ plan, onClose }) {
  const dispatch = useDispatch();
  const {
    allFeatures, planFeatureIdsMap, planFeaturesMutating, message, error,
  } = useSelector((s) => s.subscription);

  // draft = array of enabled feature IDs (numbers)
  const [draft, setDraft] = useState(null);

  // 1. Load full features list (cached after first fetch)
  useEffect(() => {
    if (!allFeatures || allFeatures.length === 0) {
      dispatch(fetchAllFeatures());
    }
  }, [dispatch]);

  // 2. Load this plan's enabled feature IDs
  useEffect(() => {
    if (!plan) return;
    if (planFeatureIdsMap[plan.id]) {
      setDraft([...planFeatureIdsMap[plan.id]]);
    } else {
      dispatch(fetchPlanFeatures(plan.id));
    }
  }, [plan?.id]);

  // 3. Sync draft when planFeatureIdsMap updates from the fetch
  useEffect(() => {
    if (plan && planFeatureIdsMap[plan.id] && draft === null) {
      setDraft([...planFeatureIdsMap[plan.id]]);
    }
  }, [planFeatureIdsMap, plan?.id]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearSubscriptionMessage()); }
  }, [message]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Could not save features');
      dispatch(clearSubscriptionError());
    }
  }, [error]);

  const toggle = (id) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const result = await dispatch(updatePlanFeatures({ planId: plan.id, featureIds: draft }));
    if (updatePlanFeatures.fulfilled.match(result)) onClose();
  };

  const isLoading = draft === null || !allFeatures || allFeatures.length === 0;

  // Group features by role for display
  const grouped = ['instructor', 'studio', 'both'].map((role) => ({
    role,
    label: ROLE_LABELS[role],
    items: (allFeatures || []).filter((f) => f.role === role),
  })).filter((g) => g.items.length > 0);

  return (
    <Modal
      open
      size="md"
      title={`Manage features — ${plan?.name}`}
      subtitle="Toggle features included in this plan. Changes apply immediately to all subscribers."
      onClose={onClose}
      bodyClassName="p-6 space-y-5 max-h-[65vh] overflow-y-auto"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={planFeaturesMutating}>
            Cancel
          </Button>
          <Button
            variant="primary" icon={Check}
            loading={planFeaturesMutating}
            disabled={isLoading}
            onClick={handleSave}
          >
            Save features
          </Button>
        </>
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#9A9A94]" />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ role, label, items }) => (
            <div key={role}>
              <p className="text-[10px] font-bold text-[#9A9A94] uppercase tracking-widest mb-3">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((feat) => {
                  const enabled = draft.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggle(feat.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        enabled
                          ? 'border-[#7F77DD] bg-[#7F77DD08]'
                          : 'border-[#E5E0D8] bg-white hover:border-[#7F77DD]/40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          enabled ? 'bg-[#7F77DD]' : 'bg-[#F5F2EC] border border-[#E5E0D8]'
                        }`}
                      >
                        {enabled && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3E3D38]">{feat.label}</p>
                        <p className="text-[10px] text-[#9A9A94]">{feat.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}