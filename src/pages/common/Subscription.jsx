import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, Sparkles, Calendar, ArrowRight } from "lucide-react";

import { ROLE_THEME } from "../../config/portalConfig";
import {
  fetchPlans,
  fetchCurrentSubscription,
  changePlan,
} from "../../store/actions/subscriptionAction";
import {
  clearSubscriptionMessage,
  clearSubscriptionError,
} from "../../store/slices/subscriptionSlice";
import { STATUS } from "../../constants/apiConstants";
import { Button } from "../../components/ui";
import { CardSkeleton } from "../../components/feedback";
import CheckoutModal from "../../features/billing/CheckoutModal";
import { useFetchSetupIntent } from "../../hooks/useStripeCheckout";

// Used as the source of truth when /api/plans returns an empty list
// (e.g. before the seed runs). Mirrors the shape the live API uses so
// the rendering below doesn't need to branch on which source is in use.
const FALLBACK_PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 15,
    period: "/mo",
    description: "Flexible, cancel anytime",
    highlighted: false,
  },
  {
    id: "biannual",
    name: "6 Months",
    price: 45,
    period: "/6mo",
    description: "Save 50% vs monthly",
    highlighted: true,
  },
  {
    id: "annual",
    name: "12 Months",
    price: 60,
    period: "/yr",
    description: "Best value — ~$5/mo",
    highlighted: false,
  },
];

const PLAN_ORDER = ["monthly", "biannual", "annual"];

/**
 * Subscription — shared between instructor and studio portals.
 * Shows the current plan + a switcher for the available plans. The
 * Payment History page (/portal/payments | /studio/payments) is its
 * own route — linked from the header here.
 */
export default function Subscription() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { plans, currentSubscription, status, message, error } = useSelector(
    (s) => s.subscription,
  );

  const role = user?.role || "instructor";
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;
  const paymentsPath =
    role === "studio" ? "/studio/payments" : "/portal/payments";

  const [switchingPlanId, setSwitchingPlanId] = useState(null);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  // Surface backend success / failure messages from the slice.
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearSubscriptionMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Could not update plan");
      dispatch(clearSubscriptionError());
    }
  }, [error, dispatch]);

  // Normalise the plans list (API or fallback) into one shape so the
  // card map below doesn't have to handle a dozen field aliases.
  const livePlans = (plans?.length ? plans : FALLBACK_PLANS).map((p) => ({
    id: p.id ?? p.slug ?? p.code,
    name: p.name || p.label || p.id,
    price: p.price ?? p.price_monthly ?? p.amount ?? 0,
    period: p.period || p.per || (p.interval ? `/${p.interval}` : ""),
    description: p.description || p.desc || "",
    features: p.features || [],
    highlighted: Boolean(p.highlighted ?? p.highlight ?? p.is_featured),
  }));

  const sortedPlans = [...livePlans].sort((a, b) => {
    const ai = PLAN_ORDER.indexOf(String(a.id).toLowerCase());
    const bi = PLAN_ORDER.indexOf(String(b.id).toLowerCase());
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Current plan id — try a handful of likely API shapes plus the
  // flattened user payload (auth slice merges `detail` onto user).
  const currentPlanId = String(
    currentSubscription?.plan?.id ??
      currentSubscription?.plan_id ??
      currentSubscription?.plan ??
      user?.subscription?.plan ??
      user?.plan ??
      "",
  ).toLowerCase();

  const currentPlan = sortedPlans.find(
    (p) => String(p.id).toLowerCase() === currentPlanId,
  );
  const renewalDate =
    currentSubscription?.renewal_date ||
    currentSubscription?.current_period_end ||
    user?.subscriptionRenews ||
    user?.subscription_renews;

  const {
    clientSecret,
    fetch: fetchClientSecret,
    reset: resetClientSecret,
  } = useFetchSetupIntent();
  const [pendingPlanId, setPendingPlanId] = useState(null);

  const hasPaymentMethod = Boolean(
    user?.defaultPaymentMethodId || user?.default_payment_method_id,
  );

  const handleSwitch = async (planId) => {
    if (String(planId).toLowerCase() === currentPlanId) return;

    if (!hasPaymentMethod) {
      setPendingPlanId(planId);
      await fetchClientSecret();
      return;
    }

    setSwitchingPlanId(planId);
    await dispatch(changePlan({ planId }));
    await dispatch(fetchCurrentSubscription());
    setSwitchingPlanId(null);
  };

  const handleCardSaved = async () => {
    const planId = pendingPlanId;
    setPendingPlanId(null);
    resetClientSecret();
    if (!planId) return;

    setSwitchingPlanId(planId);
    await dispatch(changePlan({ planId }));
    await dispatch(fetchCurrentSubscription());
    setSwitchingPlanId(null);
  };

  const loading =
    status === STATUS.LOADING && plans.length === 0 && !currentSubscription;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">
            Subscription
          </h1>
          <p className="text-[#9A9A94] text-sm mt-1">
            Manage your Moving Guru plan
          </p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">
            Subscription
          </h1>
          <p className="text-[#9A9A94] text-sm mt-1">
            Manage your Moving Guru plan
          </p>
        </div>
        <Link
          to={paymentsPath}
          className="text-xs font-semibold inline-flex items-center gap-1.5 hover:underline"
          style={{ color: theme.accent }}
        >
          View Payment History <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Current plan card ──────────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/80 text-[10px] font-semibold tracking-widest uppercase mb-2">
              Current Plan
            </p>
            <p className="font-unbounded text-3xl font-black leading-none">
              {currentPlan?.name || "No active plan"}
            </p>
            {currentPlan && (
              <p className="text-white/80 text-sm mt-2">
                ${currentPlan.price}
                {currentPlan.period}
                {currentPlan.description ? ` · ${currentPlan.description}` : ""}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>
        {renewalDate && (
          <div className="mt-5 pt-5 border-t border-white/20 flex items-center gap-2 text-xs text-white/80">
            <Calendar size={12} /> Next renewal · {renewalDate}
          </div>
        )}

        {currentSubscription?.cancelAtPeriodEnd ? (
          <Button onClick={() => dispatch(resumeSubscription())}>Resume</Button>
        ) : (
          currentPlan && (
            <Button
              variant="secondary"
              onClick={() => dispatch(cancelSubscription())}
            >
              Cancel at period end
            </Button>
          )
        )}
      </div>

      {/* ── Plan switcher ──────────────────────────────────── */}
      <div>
        <h2 className="font-unbounded text-xs font-bold text-[#3E3D38] tracking-wider uppercase mb-3">
          Change Plan
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlans.map((p) => {
            const isCurrent = String(p.id).toLowerCase() === currentPlanId;
            const isSwitching = switchingPlanId === p.id;
            const borderCls = isCurrent
              ? "border-[#3E3D38]"
              : p.highlighted
                ? "border-[#E89560]"
                : "border-[#E5E0D8] hover:border-[#3E3D38]/30";

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

                <p className="font-unbounded text-base font-black text-[#3E3D38]">
                  {p.name}
                </p>
                {p.description && (
                  <p className="text-[#9A9A94] text-xs mt-1">{p.description}</p>
                )}

                <div className="my-4">
                  <span className="font-unbounded text-3xl font-black text-[#3E3D38]">
                    ${p.price}
                  </span>
                  <span className="text-[#9A9A94] text-xs ml-1">
                    {p.period}
                  </span>
                </div>

                {p.features.length > 0 && (
                  <ul className="space-y-1.5 mb-4">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-[#6B6B66]"
                      >
                        <Check
                          size={12}
                          className="text-[#6BE6A4] mt-0.5 flex-shrink-0"
                        />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-2">
                  <Button
                    variant={isCurrent ? "secondary" : "primary"}
                    size="sm"
                    fullWidth
                    disabled={isCurrent}
                    loading={isSwitching}
                    onClick={() => handleSwitch(p.id)}
                  >
                    {isCurrent ? "Current Plan" : `Switch to ${p.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <p className="text-center text-[#9A9A94] text-xs">
        Questions about your plan? Contact{" "}
        <a
          href="mailto:admin@movingguru.co"
          className="text-[#2DA4D6] hover:underline"
        >
          admin@movingguru.co
        </a>
      </p>
      <CheckoutModal
        open={Boolean(clientSecret)}
        clientSecret={clientSecret}
        role={role}
        title="Add a payment method"
        ctaLabel={`Subscribe to ${
          sortedPlans.find((p) => p.id === pendingPlanId)?.name || "plan"
        }`}
        onClose={() => {
          setPendingPlanId(null);
          resetClientSecret();
        }}
        onSuccess={handleCardSaved}
      />
    </div>
  );
}
