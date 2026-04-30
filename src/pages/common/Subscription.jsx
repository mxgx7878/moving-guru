// src/pages/common/Subscription.jsx
//
// CHANGES:
// 1. Renewal date formatted (no more raw UTC ISO string)
// 2. cancelAtPeriodEnd UI: shows "Your subscription will cancel on DATE"
//    + Resume button (instead of just Resume button alone)
// 3. Cancel/resume buttons disabled during status === LOADING

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Check, Sparkles, Calendar, ArrowRight, Star, CreditCard, AlertTriangle,
} from 'lucide-react';

import { ROLE_THEME } from '../../config/portalConfig';
import {
  fetchPlans,
  fetchCurrentSubscription,
  changePlan,
  cancelSubscription,
  resumeSubscription,
} from '../../store/actions/subscriptionAction';
import { getMe } from '../../store/actions/authAction';
import {
  clearSubscriptionMessage,
  clearSubscriptionError,
} from '../../store/slices/subscriptionSlice';
import { STATUS } from '../../constants/apiConstants';
import { Button } from '../../components/ui';
import { CardSkeleton } from '../../components/feedback';
import CheckoutModal from '../../features/billing/CheckoutModal';
import { useFetchSetupIntent } from '../../hooks/useStripeCheckout';

// ─── Date formatting helper ───────────────────────────────────────
// Backend stores dates as UTC strings. Convert to user's locale + readable format.
// Returns null if the value can't be parsed so callers can fall back.
const formatDate = (iso) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  } catch {
    return null;
  }
};

function SubscriptionSkeleton({ message = 'Manage your Moving Guru plan' }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Subscription</h1>
        <p className="text-[#9A9A94] text-sm mt-1">{message}</p>
      </div>
      <CardSkeleton count={3} />
    </div>
  );
}

export default function Subscription() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { plans, currentSubscription, status, message, error } =
    useSelector((s) => s.subscription);

  const role         = user?.role || 'instructor';
  const theme        = ROLE_THEME[role] || ROLE_THEME.instructor;
  const paymentsPath = role === 'studio' ? '/studio/payments' : '/portal/payments';

  const [switchingPlanId, setSwitchingPlanId] = useState(null);
  const [pendingPlanId,   setPendingPlanId]   = useState(null);
  const [subscribing,     setSubscribing]     = useState(false);

  const {
    clientSecret,
    fetch: fetchClientSecret,
    reset: resetClientSecret,
  } = useFetchSetupIntent();

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearSubscriptionMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Could not update plan');
      dispatch(clearSubscriptionError());
    }
  }, [error, dispatch]);

  const livePlans = (plans || []).map((p) => ({
    id:          p.id ?? p.slug ?? p.code,
    name:        p.name || p.label || p.id,
    price:       p.price ?? p.price_monthly ?? p.amount ?? 0,
    period:      p.period || p.per || (p.interval ? `/${p.interval}` : ''),
    description: p.description || p.desc || '',
    features:    p.features || [],
    highlighted: Boolean(p.highlighted ?? p.highlight ?? p.isFeatured ?? p.is_featured),
    sortOrder:   Number(p.sortOrder ?? p.sort_order ?? 0),
  }));

  const sortedPlans = [...livePlans].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });

  const currentPlanId = String(
    currentSubscription?.plan?.id
    ?? currentSubscription?.plan_id
    ?? currentSubscription?.planId
    ?? user?.subscription?.plan
    ?? user?.plan
    ?? '',
  ).toLowerCase();

  const currentPlan = sortedPlans.find(
    (p) => String(p.id).toLowerCase() === currentPlanId,
  );

  // Renewal date (formatted) — try multiple field names from the API
  const renewalDateRaw =
    currentSubscription?.currentPeriodEnd
    || currentSubscription?.current_period_end
    || currentSubscription?.renewal_date;
  const renewalDate = formatDate(renewalDateRaw);

  const cancelsAtPeriodEnd = Boolean(currentSubscription?.cancelAtPeriodEnd);

  const hasPaymentMethod = Boolean(
    user?.defaultPaymentMethodId || user?.default_payment_method_id,
  );

  const refreshAfterPurchase = async () => {
    await Promise.all([
      dispatch(fetchCurrentSubscription()),
      dispatch(getMe()),
    ]);
  };

  const handleSwitch = async (planId, forceNewCard = false) => {
    if (String(planId).toLowerCase() === currentPlanId && !forceNewCard) return;
    if (switchingPlanId || subscribing) return;

    setSwitchingPlanId(planId);

    if (!hasPaymentMethod || forceNewCard) {
      setPendingPlanId(planId);
      await fetchClientSecret();
      return;
    }

    setSubscribing(true);
    const result = await dispatch(changePlan({ planId }));
    if (changePlan.fulfilled.match(result)) {
      await refreshAfterPurchase();
    }
    setSwitchingPlanId(null);
    setSubscribing(false);
  };

  const handleCardSaved = async (paymentMethodId) => {
    const planId = pendingPlanId;
    setPendingPlanId(null);
    resetClientSecret();
    if (!planId || !paymentMethodId) {
      setSwitchingPlanId(null);
      return;
    }

    setSubscribing(true);
    const result = await dispatch(changePlan({ planId, paymentMethodId }));
    if (changePlan.fulfilled.match(result)) {
      await refreshAfterPurchase();
    }
    setSwitchingPlanId(null);
    setSubscribing(false);
  };

  const handleCloseModal = () => {
    setPendingPlanId(null);
    resetClientSecret();
    setSwitchingPlanId(null);
  };

  const initialLoading =
    status === STATUS.LOADING && plans.length === 0 && !currentSubscription;

  if (initialLoading) return <SubscriptionSkeleton />;
  if (subscribing)    return <SubscriptionSkeleton message="Activating your subscription…" />;

  const mutating = status === STATUS.LOADING;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Subscription</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Manage your Moving Guru plan</p>
        </div>
        <Link
          to={paymentsPath}
          className="text-xs font-semibold inline-flex items-center gap-1.5 hover:underline"
          style={{ color: theme.accent }}
        >
          View Payment History <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Current plan card ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)` }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/80 text-[10px] font-semibold tracking-widest uppercase mb-2">
              Current Plan
            </p>
            <p className="font-unbounded text-3xl font-black leading-none">
              {currentPlan?.name || 'No active plan'}
            </p>
            {currentPlan && (
              <p className="text-white/80 text-sm mt-2">
                ${currentPlan.price}{currentPlan.period}
                {currentPlan.description ? ` · ${currentPlan.description}` : ''}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        {/* ── Renewal info / cancel notice ── */}
        {renewalDate && currentPlan && (
          <div className="mt-5 pt-5 border-t border-white/20">
            {cancelsAtPeriodEnd ? (
              <div className="flex items-start gap-2 text-xs text-white">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Your subscription will cancel on {renewalDate}</p>
                  <p className="text-white/70 text-[11px] mt-0.5">
                    You'll keep access until then. Resume any time before that.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Calendar size={12} /> Next renewal · {renewalDate}
              </div>
            )}
          </div>
        )}

        {/* ── Action button (Resume vs Cancel) ── */}
        {currentPlan && (
          cancelsAtPeriodEnd ? (
            <Button
              className="mt-4"
              loading={mutating}
              disabled={mutating}
              onClick={() => dispatch(resumeSubscription())}
            >
              Resume subscription
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="mt-4"
              loading={mutating}
              disabled={mutating}
              onClick={() => dispatch(cancelSubscription())}
            >
              Cancel at period end
            </Button>
          )
        )}
      </div>

      {/* ── Plan switcher ─────────────────────────────────────── */}
      <div>
        <h2 className="font-unbounded text-xs font-bold text-[#3E3D38] tracking-wider uppercase mb-3">
          {currentPlan ? 'Change Plan' : 'Choose a Plan'}
        </h2>

        {sortedPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F2EC] flex items-center justify-center mx-auto mb-3">
              <Star size={20} className="text-[#9A9A94]" />
            </div>
            <p className="font-semibold text-[#3E3D38] text-sm">No plans available</p>
            <p className="text-[#9A9A94] text-xs mt-1 max-w-sm mx-auto">
              Subscription plans haven't been set up yet. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPlans.map((p) => {
              const isCurrent   = String(p.id).toLowerCase() === currentPlanId;
              const isSwitching = switchingPlanId === p.id;
              const isAnyBusy   = switchingPlanId !== null || mutating;
              const borderCls   = isCurrent
                ? 'border-[#3E3D38]'
                : p.highlighted
                  ? 'border-[#E89560]'
                  : 'border-[#E5E0D8] hover:border-[#3E3D38]/30';

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col ${borderCls}`}
                >
                  {(isCurrent || p.highlighted) && (
                    <div className="flex justify-end mb-2">
                      {isCurrent ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#3E3D38] text-white">
                          CURRENT
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E89560] text-white">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  )}

                  <p className="font-unbounded text-base font-black text-[#3E3D38]">{p.name}</p>
                  {p.description && (
                    <p className="text-[#9A9A94] text-xs mt-1">{p.description}</p>
                  )}

                  <div className="my-4">
                    <span className="font-unbounded text-3xl font-black text-[#3E3D38]">
                      ${p.price}
                    </span>
                    <span className="text-[#9A9A94] text-xs ml-1">{p.period}</span>
                  </div>

                  {p.features.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-[#6B6B66]">
                          <Check size={12} className="text-[#6BE6A4] mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-2 space-y-2">
                    <Button
                      variant={isCurrent ? 'secondary' : 'primary'}
                      size="sm"
                      fullWidth
                      disabled={isCurrent || isAnyBusy}
                      loading={isSwitching}
                      onClick={() => handleSwitch(p.id)}
                      style={!isCurrent ? { background: theme.accent } : undefined}
                    >
                      {isCurrent ? 'Current Plan' : `Switch to ${p.name}`}
                    </Button>

                    {!isCurrent && hasPaymentMethod && (
                      <button
                        type="button"
                        disabled={isAnyBusy}
                        onClick={() => handleSwitch(p.id, true)}
                        className="w-full flex items-center justify-center gap-1.5 text-[11px] text-[#6B6B66] hover:text-[#3E3D38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard size={11} />
                        Use a different card
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-[#9A9A94] text-xs">
        Questions about your plan?{' '}
        <a href="mailto:admin@movingguru.co" className="text-[#2DA4D6] hover:underline">
          admin@movingguru.co
        </a>
      </p>

      <CheckoutModal
        open={Boolean(clientSecret)}
        clientSecret={clientSecret}
        role={role}
        title={hasPaymentMethod ? 'Use a different card' : 'Add a payment method'}
        ctaLabel={`Subscribe to ${sortedPlans.find((p) => p.id === pendingPlanId)?.name || 'plan'}`}
        onClose={handleCloseModal}
        onSuccess={handleCardSaved}
      />
    </div>
  );
}