import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../components/ui';
import { fetchPlans, changePlan } from '../../store/actions/subscriptionAction';
import { STATUS } from '../../constants/apiConstants';

// Lightweight change-plan dialog. Opens from the Subscription page,
// fetches the available plans, lets the user pick one, then dispatches
// the changePlan thunk. Closes on success and surfaces a toast.
export default function ChangePlanModal({ open, currentPlan, onClose }) {
  const dispatch = useDispatch();
  const { plans, status } = useSelector((s) => s.subscription);
  const [selected, setSelected] = useState(currentPlan || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && plans.length === 0) dispatch(fetchPlans());
  }, [open, plans.length, dispatch]);

  useEffect(() => {
    if (open) setSelected(currentPlan || '');
  }, [open, currentPlan]);

  const loading = status === STATUS.LOADING && plans.length === 0;

  const options = useMemo(() => (
    plans.length > 0
      ? plans
      // Fallback presets in case the plans endpoint is empty — keeps the
      // modal usable while backend catches up.
      : [
          { id: 'free',    name: 'Free',    price_monthly: 0,  description: 'Basic access — limited features' },
          { id: 'basic',   name: 'Basic',   price_monthly: 9,  description: 'Everyday features for active users' },
          { id: 'pro',     name: 'Pro',     price_monthly: 19, description: 'Unlock search + messaging priority' },
          { id: 'premium', name: 'Premium', price_monthly: 39, description: 'Featured placement + full access' },
        ]
  ), [plans]);

  const handleConfirm = async () => {
    if (!selected) { toast.error('Choose a plan to continue.'); return; }
    setSubmitting(true);
    const result = await dispatch(changePlan({ plan: selected, plan_id: selected }));
    setSubmitting(false);
    if (changePlan.fulfilled.match(result)) {
      toast.success(`Plan updated to ${selected}`);
      onClose?.();
    } else {
      toast.error(result.payload || 'Could not change plan — try again later.');
    }
  };

  if (!open) return null;

  return (
    <Modal
      open
      size="md"
      onClose={onClose}
      title="Change Plan"
      bodyClassName="p-6 space-y-4"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={handleConfirm}
            disabled={!selected || selected === currentPlan}
          >
            Confirm Change
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#6B6B66]">
        Pick a plan that suits your needs. Changes take effect on your next billing cycle.
      </p>

      {loading ? (
        <div className="py-10 text-center text-sm text-[#9A9A94]">Loading plans…</div>
      ) : (
        <div className="space-y-2">
          {options.map((plan) => {
            const id = plan.id || plan.slug || plan.name;
            const active = String(selected) === String(id);
            const isCurrent = String(currentPlan) === String(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-colors
                  ${active
                    ? 'border-[#2DA4D6] bg-[#2DA4D6]/5'
                    : 'border-[#E5E0D8] hover:border-[#2DA4D6]/50'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${active ? 'bg-[#2DA4D6] text-white' : 'bg-[#FBF8E4] text-[#3E3D38]'}`}>
                  {active ? <Check size={16} /> : <Sparkles size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-[#3E3D38] capitalize">{plan.name || id}</p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-[#6BE6A4]/25 text-[#3E3D38] px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-[#9A9A94] mt-0.5">{plan.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-unbounded text-sm font-black text-[#3E3D38]">
                    ${Number(plan.price_monthly ?? plan.price ?? 0).toFixed(0)}
                  </p>
                  <p className="text-[10px] text-[#9A9A94]">/ month</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
