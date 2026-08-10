import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Elements, CardElement } from '@stripe/react-stripe-js';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROLE_THEME } from '../../config/portalConfig';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import axiosInstance from '../../config/axiosInstance';
import { loadStripeOnce } from '../../services/stripe';
import logo from '../../assets/logo.png';
import {
  changePlan,
  fetchPlans,
  fetchCurrentSubscription,
} from '../../store/actions/subscriptionAction';
import { getMe, logoutUser } from '../../store/actions/authAction';
import {
  confirmSubscriptionPayment,
  useFetchSetupIntent,
  useStripeCheckout,
} from '../../hooks/useStripeCheckout';
import PromoCodeField from '../../features/billing/PromoCodeField';

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '15px',
      color: '#292824',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#AAA59D' },
      iconColor: '#6B6B66',
    },
    invalid: { color: '#DC2626', iconColor: '#DC2626' },
  },
};

const CURRENCY_SYMBOLS = {
  USD: '$', AUD: '$', CAD: '$', NZD: '$', GBP: '£', EUR: '€', INR: '₹', AED: 'د.إ',
};

const CARD_BRANDS = {
  amex: 'American Express',
  diners: 'Diners Club',
  discover: 'Discover',
  jcb: 'JCB',
  mastercard: 'Mastercard',
  unionpay: 'UnionPay',
  visa: 'Visa',
};

const normalisePlan = (plan) => ({
  ...plan,
  id: plan.id ?? plan.slug ?? plan.code,
  name: plan.name || plan.label || 'Subscription plan',
  description: plan.description || plan.desc || '',
  price: Number(plan.price ?? plan.amount ?? 0),
  discountedPrice: Number(plan.discountedPrice ?? plan.price ?? 0),
  hasDiscount: Boolean(plan.hasDiscount),
  interval: plan.interval || 'month',
  intervalCount: Number(plan.intervalCount || 1),
  trialPeriodDays: Number(plan.trialPeriodDays ?? plan.trial_period_days ?? 0),
  currency: String(plan.currency || 'USD').toUpperCase(),
  features: plan.plan_features || plan.planFeatures || [],
  highlighted: Boolean(plan.isFeatured ?? plan.highlighted ?? plan.highlight),
  sortOrder: Number(plan.sortOrder ?? plan.sort_order ?? 0),
});

export default function SubscriptionCheckout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { plans, currentSubscription } = useSelector((state) => state.subscription);
  const isPastDue = currentSubscription?.status === 'past_due';

  const [selectedPlanId, setSelectedPlanId] = useState(
    () => sessionStorage.getItem('pending_subscription_plan_id') || '',
  );
  const [promo, setPromo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const defaultPaymentMethodId =
    user?.defaultPaymentMethodId || user?.default_payment_method_id || null;
  const [paymentMethods, setPaymentMethods] = useState(
    () => defaultPaymentMethodId
      ? [{ id: defaultPaymentMethodId, isDefault: true }]
      : [],
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    defaultPaymentMethodId,
  );
  const [savedCardLoading, setSavedCardLoading] = useState(
    Boolean(defaultPaymentMethodId),
  );
  const [useNewCard, setUseNewCard] = useState(!defaultPaymentMethodId);
  const setupStarted = useRef(false);

  const {
    clientSecret,
    loading: setupLoading,
    fetch: fetchClientSecret,
  } = useFetchSetupIntent();

  const ensureCardForm = useCallback(async () => {
    if (clientSecret || setupStarted.current) return clientSecret;

    setupStarted.current = true;
    const secret = await fetchClientSecret();
    if (!secret) setupStarted.current = false;
    return secret;
  }, [clientSecret, fetchClientSecret]);

  const livePlans = useMemo(
    () => (plans || [])
      .map(normalisePlan)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [plans],
  );

  const selectedPlan = livePlans.find(
    (plan) => String(plan.id) === String(selectedPlanId),
  );

  const recoveryPlan = currentSubscription?.plan
    ? normalisePlan(currentSubscription.plan)
    : selectedPlan;

  useEffect(() => {
    let mounted = true;

    Promise.all([
      dispatch(fetchPlans()),
      dispatch(fetchCurrentSubscription()),
    ]).finally(() => {
      if (mounted) setSubscriptionChecked(true);
    });

    return () => { mounted = false; };
  }, [dispatch]);

  useEffect(() => {
    const currentPlanId = currentSubscription?.plan?.id
      || currentSubscription?.planId
      || currentSubscription?.plan_id;

    if (isPastDue && currentPlanId) {
      setSelectedPlanId(String(currentPlanId));
    } else if (!selectedPlanId && livePlans.length > 0) {
      setSelectedPlanId(String(livePlans[0].id));
    }
  }, [currentSubscription, isPastDue, livePlans, selectedPlanId]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedPaymentMethod = async () => {
      setSavedCardLoading(true);
      try {
        const { data } = await axiosInstance.get(
          API_ENDPOINTS.ATTACH_PAYMENT_METHOD,
        );
        if (cancelled) return;

        const methods = Array.isArray(data.data?.paymentMethods)
          ? data.data.paymentMethods
          : data.data?.paymentMethod
            ? [data.data.paymentMethod]
            : [];

        if (methods.length > 0) {
          const defaultId = data.data?.defaultPaymentMethodId
            || methods.find((method) => method.isDefault)?.id
            || methods[0].id;
          setPaymentMethods(methods);
          setSelectedPaymentMethodId(defaultId);
          setUseNewCard(false);
          return;
        }

        setPaymentMethods([]);
        setSelectedPaymentMethodId(null);
        setUseNewCard(true);
        await ensureCardForm();
      } catch {
        if (cancelled) return;

        if (defaultPaymentMethodId) {
          setPaymentMethods([{ id: defaultPaymentMethodId, isDefault: true }]);
          setSelectedPaymentMethodId(defaultPaymentMethodId);
          setUseNewCard(false);
          toast.error('Could not load card details, but you can still use the default payment method.');
        } else {
          setPaymentMethods([]);
          setSelectedPaymentMethodId(null);
          setUseNewCard(true);
          await ensureCardForm();
        }
      } finally {
        if (!cancelled) setSavedCardLoading(false);
      }
    };

    loadSavedPaymentMethod();
    return () => { cancelled = true; };
  }, [defaultPaymentMethodId, ensureCardForm]);

  const priceView = useMemo(() => {
    if (!selectedPlan) return { original: 0, final: 0 };

    const original = selectedPlan.price;
    let final = selectedPlan.hasDiscount
      ? selectedPlan.discountedPrice
      : original;

      console.log(promo, 'promo');
    if (promo) {
      final = promo.discountType === 'percent'
        ? final * (1 - Number(promo.discountValue) / 100)
        : final - Number(promo.discountValue);
    }

    return {
      original,
      final: Math.max(0, Math.round(final * 100) / 100),
    };
  }, [selectedPlan, promo]);

  const waitForActivation = async () => {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const result = await dispatch(getMe());
      if (getMe.fulfilled.match(result)) {
        const refreshedUser = result.payload?.data?.user || result.payload?.data;
        if (refreshedUser?.status === 'active') return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  };

  const retryPastDuePayment = async (paymentMethodId) => {
    if (!paymentMethodId) {
      toast.error('Please select or add a payment method.');
      return false;
    }

    try {
      const { data } = await axiosInstance.post(
        API_ENDPOINTS.RETRY_SUBSCRIPTION_PAYMENT,
        { paymentMethodId },
      );

      const response = data.data || {};

      if (response.requiresPaymentConfirmation) {
        const confirmation = await confirmSubscriptionPayment(
          response.paymentClientSecret,
          paymentMethodId,
        );

        if (!confirmation.ok) {
          toast.error(
            confirmation.error || 'Payment could not be completed.',
          );
          return false;
        }
      }

      const active = await waitForActivation();

      if (!active) {
        toast.info(
          'Your payment is still being confirmed. Please wait a moment and retry.',
        );
        return false;
      }

      sessionStorage.removeItem('pending_subscription_plan_id');
      toast.success('Payment completed. Your subscription is active again.');
      navigate(
        ROLE_THEME[user?.role]?.defaultPath || '/portal/dashboard',
        { replace: true },
      );
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message
        || 'Unable to retry the subscription payment.',
      );
      return false;
    }
  };

const completeCheckout = async (
  paymentMethodId = null,
) => {
  if (processing) return;

  if (!paymentMethodId) {
    toast.error('Please select a payment method.');
    return;
  }

  if (!isPastDue && !selectedPlan) {
    toast.error('Please select a plan.');
    return;
  }

  setProcessing(true);

  try {
    if (isPastDue) {
      await retryPastDuePayment(
        paymentMethodId,
      );

      return;
    }

    const payload = {
      planId: selectedPlan.id,
      paymentMethodId,
      promoCode: promo?.code || undefined,
    };

    const result = await dispatch(
      changePlan(payload),
    );

    if (!changePlan.fulfilled.match(result)) {
      toast.error(
        result.payload ||
        'Could not create your subscription.',
      );

      return;
    }

    const response = result.payload?.data || {};

    if (response.requiresPaymentConfirmation) {
      const confirmation =
        await confirmSubscriptionPayment(
          response.paymentClientSecret,
          paymentMethodId,
        );

      if (!confirmation.ok) {
        toast.error(
          confirmation.error ||
          'Your payment could not be confirmed.',
        );

        return;
      }
    }

    const active = await waitForActivation();

    if (!active) {
      toast.info(
        'Your subscription is still being confirmed.',
      );

      return;
    }

    sessionStorage.removeItem(
      'pending_subscription_plan_id',
    );

    toast.success(
      'Your subscription is active.',
    );

    navigate(
      ROLE_THEME[user?.role]?.defaultPath ||
        '/portal/dashboard',
      {
        replace: true,
      },
    );
  } finally {
    setProcessing(false);
  }
};

  const symbol = CURRENCY_SYMBOLS[selectedPlan?.currency] || '$';
  const dueToday = selectedPlan?.trialPeriodDays > 0 ? 0 : priceView.final;

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    sessionStorage.removeItem('pending_subscription_plan_id');
    navigate('/login', { replace: true });
  };

  if (!subscriptionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto text-[#77736C]" />
          <p className="text-sm text-[#77736C] mt-3">
            Checking your subscription…
          </p>
        </div>
      </div>
    );
  }

  if (isPastDue) {
    return (
      <PastDueRecoveryPage
        subscription={currentSubscription}
        plan={recoveryPlan}
        processing={processing}
        savedCardLoading={savedCardLoading}
        paymentMethods={paymentMethods}
        selectedPaymentMethodId={selectedPaymentMethodId}
        onSelectPaymentMethod={setSelectedPaymentMethodId}
        useNewCard={useNewCard}
        setUseNewCard={setUseNewCard}
        clientSecret={clientSecret}
        setupLoading={setupLoading}
        ensureCardForm={ensureCardForm}
        onRetry={completeCheckout}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#302F2A] font-['DM_Sans']">
      <header className="border-b border-[#E6E1D8] bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">

            <img src={logo} alt="Moving Guru" className="h-8 sm:h-10" />
          </div>
          <button
            type="button"
            disabled={processing}
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B66] hover:text-[#302F2A] disabled:opacity-50"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold mb-4">
            <CheckCircle2 size={14} /> Your account has been created
          </span>
          <h1 className="font-unbounded text-2xl sm:text-4xl font-black leading-tight">
            Complete your subscription
          </h1>
          <p className="text-[#77736C] text-sm sm:text-base mt-3">
            Choose your plan and add a secure payment method to activate your Moving Guru account.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm">Subscription required to access your dashboard</p>
            <p className="text-amber-800/80 text-xs sm:text-sm mt-1">
              Your profile is saved, but dashboard and platform features remain locked until a subscription is successfully activated.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 mb-6">
          {[
            ['1', 'Account created', true],
            ['2', 'Plan & payment', false],
            ['3', 'Dashboard access', false],
          ].map(([number, label, done], index) => (
            <div key={number} className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${done ? 'bg-emerald-500 text-white' : index === 1 ? 'bg-[#302F2A] text-white' : 'bg-[#E6E1D8] text-[#8A857D]'}`}>
                {done ? <Check size={14} /> : number}
              </div>
              <span className="hidden sm:block text-xs font-semibold truncate">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-6 items-start">
          <section className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-7 shadow-sm">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9A958D]">Step 1</p>
              <h2 className="font-unbounded text-lg font-black mt-1">Confirm your plan</h2>
              <p className="text-xs text-[#858078] mt-1">You can select a different plan before completing payment.</p>
            </div>

            <div className="space-y-3">
              {livePlans.map((plan) => {
                const selected = String(plan.id) === String(selectedPlanId);
                const planSymbol = CURRENCY_SYMBOLS[plan.currency] || '$';
                const displayPrice = plan.hasDiscount ? plan.discountedPrice : plan.price;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setSelectedPlanId(String(plan.id));
                      sessionStorage.setItem('pending_subscription_plan_id', String(plan.id));
                    }}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${selected ? 'border-[#302F2A] bg-[#FAF9F6] shadow-sm' : 'border-[#E8E3DA] hover:border-[#BBB4A9]'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#302F2A]' : 'border-[#BBB4A9]'}`}>
                          {selected && <div className="w-2.5 h-2.5 bg-[#302F2A] rounded-full" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-unbounded text-sm font-black">{plan.name}</p>
                            {plan.highlighted && <span className="text-[9px] font-bold rounded-full bg-[#F5FDA6] px-2 py-0.5">POPULAR</span>}
                          </div>
                          <p className="text-xs text-[#858078] mt-1 line-clamp-2">{plan.description}</p>
                          {plan.trialPeriodDays > 0 && (
                            <p className="text-[11px] font-bold text-emerald-700 mt-1.5">
                              {plan.trialPeriodDays}-day free trial · then recurring billing
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-unbounded text-lg font-black">{planSymbol}{displayPrice.toFixed(2)}</p>
                        <p className="text-[10px] text-[#918C84]">/{plan.interval}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPlan && (
              <div className="mt-6 pt-5 border-t border-[#EEEAE3]">
                <p className="text-xs font-bold uppercase tracking-wider mb-3">Included with {selectedPlan.name}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedPlan.features.slice(0, 8).map((feature, index) => (
                    <div key={feature.id || feature.key || index} className="flex items-center gap-2 text-xs text-[#5F5B55]">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={3} />
                      <span>{feature.label || feature.name || feature.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-7 shadow-sm lg:sticky lg:top-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9A958D]">Step 2</p>
              <h2 className="font-unbounded text-lg font-black mt-1">Secure checkout</h2>
              <p className="text-xs text-[#858078] mt-1">Your card is encrypted and processed directly by Stripe.</p>
            </div>

            {selectedPlan ? (
              <>
                <div className="rounded-2xl bg-[#F7F5F0] p-4 mb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#858078]">You are purchasing</p>
                      <p className="font-unbounded text-sm font-black mt-1">{selectedPlan.name}</p>
                    </div>
                    <Sparkles size={18} className="text-[#77736C]" />
                  </div>
                  <div className="border-t border-[#E5E0D8] mt-4 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#77736C]">Billing cycle</span>
                      <span className="font-semibold capitalize">Every {selectedPlan.intervalCount > 1 ? `${selectedPlan.intervalCount} ` : ''}{selectedPlan.interval}{selectedPlan.intervalCount > 1 ? 's' : ''}</span>
                    </div>
                    {selectedPlan.trialPeriodDays > 0 && (
                      <div className="flex justify-between gap-3">
                        <span className="text-[#77736C]">Free trial</span>
                        <span className="font-semibold text-emerald-700">{selectedPlan.trialPeriodDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 text-sm pt-2 border-t border-[#E5E0D8]">
                      <span className="font-bold">Due today</span>
                      <span className="font-unbounded font-black">{symbol}{dueToday.toFixed(2)}</span>
                    </div>
                    {selectedPlan.trialPeriodDays > 0 && (
                      <p className="text-[10px] text-[#858078] leading-relaxed">
                        After your trial, Stripe will automatically charge {symbol}{priceView.final.toFixed(2)} per {selectedPlan.interval} unless cancelled before the trial ends.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <PromoCodeField onApplied={setPromo} />
                </div>

                {savedCardLoading ? (
                  <div className="rounded-2xl border border-[#E6E1D8] p-5 text-center">
                    <Loader2 size={22} className="animate-spin mx-auto text-[#8A857D]" />
                    <p className="text-xs text-[#858078] mt-2">Loading your saved payment method…</p>
                  </div>
                ) : paymentMethods.length > 0 && !useNewCard ? (
                  <SavedPaymentMethods
                    paymentMethods={paymentMethods}
                    selectedPaymentMethodId={selectedPaymentMethodId}
                    onSelect={setSelectedPaymentMethodId}
                    processing={processing}
                    ctaLabel={selectedPlan.trialPeriodDays > 0
                      ? `Start ${selectedPlan.trialPeriodDays}-Day Free Trial`
                      : priceView.final === 0
                        ? 'Activate Plan with Saved Card'
                        : `Pay ${symbol}${priceView.final.toFixed(2)} with Saved Card`}
                    onContinue={() => completeCheckout(selectedPaymentMethodId)}
                    onAddAnother={async () => {
                      setUseNewCard(true);
                      await ensureCardForm();
                    }}
                  />
                ) : clientSecret ? (
                  <>
                    <Elements stripe={loadStripeOnce()}>
                      <EmbeddedCardForm
                        clientSecret={clientSecret}
                        processing={processing}
                        ctaLabel={selectedPlan.trialPeriodDays > 0
                          ? `Start ${selectedPlan.trialPeriodDays}-Day Free Trial`
                          : priceView.final === 0
                            ? 'Save Card & Activate Plan'
                            : `Pay ${symbol}${priceView.final.toFixed(2)} & Activate Account`}
                        onPaymentMethod={completeCheckout}
                      />
                    </Elements>
                    {paymentMethods.length > 0 && (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setUseNewCard(false)}
                        className="w-full mt-3 text-xs font-bold text-[#5F5B55] hover:text-[#302F2A] underline disabled:opacity-50"
                      >
                        Use saved card instead
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-[#E6E1D8] p-5 text-center">
                    {setupLoading ? (
                      <>
                        <Loader2 size={22} className="animate-spin mx-auto text-[#8A857D]" />
                        <p className="text-xs text-[#858078] mt-2">Preparing secure payment form…</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-red-600 mb-3">The secure card form could not be loaded.</p>
                        <button type="button" onClick={ensureCardForm} className="text-xs font-bold underline">Try again</button>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#77736C]">
                    <ShieldCheck size={14} className="text-emerald-600" /> Secure payments powered by Stripe
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#77736C]">
                    <Lock size={14} /> Your card information never touches our servers
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-[#F7F5F0] p-6 text-center">
                <CreditCard size={24} className="mx-auto text-[#9A958D]" />
                <p className="text-sm font-semibold mt-3">Select a plan to continue</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function PastDueRecoveryPage({
  subscription,
  plan,
  processing,
  savedCardLoading,
  paymentMethods,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  useNewCard,
  setUseNewCard,
  clientSecret,
  setupLoading,
  ensureCardForm,
  onRetry,
  onSignOut,
}) {
  const symbol = CURRENCY_SYMBOLS[plan?.currency] || '$';
  const renewalDateValue = subscription?.currentPeriodEnd
    || subscription?.current_period_end;
  const renewalDate = renewalDateValue
    ? new Date(renewalDateValue).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#302F2A] font-['DM_Sans']">
      <header className="border-b border-[#E6E1D8] bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F5FDA6] flex items-center justify-center">
              <Globe size={18} />
            </div>
            <span className="font-unbounded text-sm sm:text-base font-black tracking-wide">
              MOVING <span className="text-coral">GURU</span>
            </span>
          </div>
          <button
            type="button"
            disabled={processing}
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B66] hover:text-[#302F2A] disabled:opacity-50"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 px-3 py-1 text-xs font-bold mb-4">
            <AlertCircle size={14} /> Renewal payment unsuccessful
          </span>
          <h1 className="font-unbounded text-2xl sm:text-4xl font-black leading-tight">
            Restore your subscription
          </h1>
          <p className="text-[#77736C] text-sm sm:text-base mt-3">
            Update your payment method and retry the outstanding renewal payment to regain access.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 flex items-start gap-3">
          <Lock size={19} className="text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900 text-sm">
              Dashboard access is temporarily locked
            </p>
            <p className="text-red-800/80 text-xs sm:text-sm mt-1">
              Your subscription has not been cancelled. Access returns automatically after the outstanding invoice is paid.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-6 items-start">
          <section className="space-y-5">
            <div className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-7 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9A958D]">
                Current subscription
              </p>
              <div className="flex items-start justify-between gap-4 mt-3">
                <div>
                  <h2 className="font-unbounded text-xl font-black">
                    {plan?.name || 'Subscription plan'}
                  </h2>
                  <p className="text-sm text-[#77736C] mt-2">
                    {symbol}{Number(plan?.price || 0).toFixed(2)} per {plan?.interval || 'month'}
                  </p>
                </div>
                <span className="rounded-full bg-red-50 text-red-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                  Past due
                </span>
              </div>

              <div className="mt-5 pt-5 border-t border-[#EEEAE3] space-y-3 text-xs">
                {renewalDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#858078]">Failed renewal date</span>
                    <span className="font-bold">{renewalDate}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-[#858078]">Subscription status</span>
                  <span className="font-bold text-red-700">Payment required</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <RefreshCw size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">What happens next?</p>
                  <ol className="mt-2 space-y-1.5 text-xs text-emerald-900/75 list-decimal pl-4">
                    <li>Select a funded saved card or add another card.</li>
                    <li>Stripe retries your outstanding renewal invoice securely.</li>
                    <li>Your dashboard unlocks automatically after payment succeeds.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-7 shadow-sm lg:sticky lg:top-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9A958D]">
                Payment recovery
              </p>
              <h2 className="font-unbounded text-lg font-black mt-1">
                Choose a card and retry
              </h2>
              <p className="text-xs text-[#858078] mt-1">
                The selected card becomes the default for this subscription and future renewals.
              </p>
            </div>

            {savedCardLoading ? (
              <div className="rounded-2xl border border-[#E6E1D8] p-5 text-center">
                <Loader2 size={22} className="animate-spin mx-auto text-[#8A857D]" />
                <p className="text-xs text-[#858078] mt-2">Loading your saved cards…</p>
              </div>
            ) : paymentMethods.length > 0 && !useNewCard ? (
              <SavedPaymentMethods
                paymentMethods={paymentMethods}
                selectedPaymentMethodId={selectedPaymentMethodId}
                onSelect={onSelectPaymentMethod}
                processing={processing}
                ctaLabel="Update Card & Retry Payment"
                onContinue={() => onRetry(selectedPaymentMethodId)}
                onAddAnother={async () => {
                  setUseNewCard(true);
                  await ensureCardForm();
                }}
              />
            ) : clientSecret ? (
              <>
                <Elements stripe={loadStripeOnce()}>
                  <EmbeddedCardForm
                    clientSecret={clientSecret}
                    processing={processing}
                    ctaLabel="Save Card & Retry Payment"
                    onPaymentMethod={onRetry}
                    consentText="By continuing, you authorise Stripe to retry the outstanding subscription invoice and use this card for future renewals."
                  />
                </Elements>
                {paymentMethods.length > 0 && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setUseNewCard(false)}
                    className="w-full mt-3 text-xs font-bold text-[#5F5B55] hover:text-[#302F2A] underline disabled:opacity-50"
                  >
                    Use a saved card instead
                  </button>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-[#E6E1D8] p-5 text-center">
                {setupLoading ? (
                  <>
                    <Loader2 size={22} className="animate-spin mx-auto text-[#8A857D]" />
                    <p className="text-xs text-[#858078] mt-2">Preparing secure payment form…</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-red-600 mb-3">
                      The secure card form could not be loaded.
                    </p>
                    <button
                      type="button"
                      onClick={ensureCardForm}
                      className="text-xs font-bold underline"
                    >
                      Try again
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-[#77736C]">
                <ShieldCheck size={14} className="text-emerald-600" />
                Secure payments powered by Stripe
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#77736C]">
                <Lock size={14} /> Your card information never touches our servers
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SavedPaymentMethods({
  paymentMethods,
  selectedPaymentMethodId,
  onSelect,
  processing,
  ctaLabel,
  onContinue,
  onAddAnother,
}) {
  return (
    <div>
      <p className="text-xs font-bold mb-2">Choose a payment method</p>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {paymentMethods.map((paymentMethod) => {
          const selected = paymentMethod.id === selectedPaymentMethodId;
          const brand = CARD_BRANDS[paymentMethod.brand]
            || paymentMethod.brand
            || 'Saved card';
          const expiry = paymentMethod.expMonth && paymentMethod.expYear
            ? `${String(paymentMethod.expMonth).padStart(2, '0')}/${String(paymentMethod.expYear).slice(-2)}`
            : null;

          return (
            <button
              key={paymentMethod.id}
              type="button"
              disabled={processing}
              onClick={() => onSelect(paymentMethod.id)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-colors ${selected ? 'border-emerald-500 bg-emerald-50/50' : 'border-[#E6E1D8] hover:border-[#AAA49A]'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E6E1D8] flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} className={selected ? 'text-emerald-700' : 'text-[#77736C]'} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-[#302F2A]">
                      {brand}{paymentMethod.last4 ? ` •••• ${paymentMethod.last4}` : ''}
                    </p>
                    {paymentMethod.isDefault && (
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#77736C] mt-1">
                    {expiry ? `Expires ${expiry}` : 'Saved payment method'}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-emerald-600' : 'border-[#BBB4A9]'}`}>
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={processing || !selectedPaymentMethodId}
        onClick={onContinue}
        className="w-full mt-5 rounded-xl bg-[#B4FF5A] hover:bg-[#A7F148] text-[#22221F] px-4 py-3.5 text-sm font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing && <Loader2 size={16} className="animate-spin" />}
        {processing ? 'Confirming your subscription…' : ctaLabel}
      </button>

      <button
        type="button"
        disabled={processing}
        onClick={onAddAnother}
        className="w-full mt-3 rounded-xl border border-[#DCD6CC] bg-white hover:bg-[#F7F5F0] px-4 py-3 text-xs font-bold text-[#5F5B55] transition-colors disabled:opacity-50"
      >
        Add another card
      </button>

      <p className="text-[10px] text-center text-[#918C84] mt-3 leading-relaxed">
        The selected card becomes your default payment method for this subscription and future renewals.
      </p>
    </div>
  );
}

function EmbeddedCardForm({
  clientSecret,
  processing,
  ctaLabel,
  onPaymentMethod,
  consentText = 'By continuing, you authorise recurring charges according to the selected plan. You can manage or cancel your subscription from your account after activation.',
}) {
  const { confirmCard, busy } = useStripeCheckout();
  const [ready, setReady] = useState(false);
  const disabled = processing || busy || !ready;

  const submit = async () => {
    if (disabled) return;
    const result = await confirmCard(clientSecret);
    if (result.ok) await onPaymentMethod(result.paymentMethodId);
  };

  return (
    <div>
      <label className="block text-xs font-bold mb-2">Card details</label>
      <div className="rounded-xl border border-[#DCD6CC] bg-white px-4 py-4 focus-within:border-[#302F2A] transition-colors">
        <CardElement options={CARD_OPTIONS} onReady={() => setReady(true)} />
      </div>
      <p className="text-[10px] text-[#918C84] mt-2">
        Enter your card number, expiration date and security code.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={submit}
        className="w-full mt-5 rounded-xl bg-[#B4FF5A] hover:bg-[#A7F148] text-[#22221F] px-4 py-3.5 text-sm font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {(processing || busy) && <Loader2 size={16} className="animate-spin" />}
        {processing ? 'Confirming your subscription…' : ctaLabel}
      </button>
      <p className="text-[10px] text-center text-[#918C84] mt-3 leading-relaxed">
        {consentText}
      </p>
    </div>
  );
}
