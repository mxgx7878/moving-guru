// src/hooks/useStripeCheckout.js
//
// CHANGES:
// - confirmAndAttach renamed to confirmCard since we don't attach anymore
// - No longer dispatches attachPaymentMethod — caller passes paymentMethodId
//   directly to changePlan() in a single atomic call
// - Cleaner DRY flow: SetupIntent confirms → return paymentMethodId → done

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import { createSetupIntent } from '../store/actions/subscriptionAction';

/**
 * Confirms the SetupIntent and returns the resulting paymentMethodId.
 * Caller is responsible for what to do next (subscribe with it, etc).
 */
export function useStripeCheckout() {
  const stripe   = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const confirmCard = useCallback(async () => {
    if (!stripe || !elements) {
      toast.error('Payment form not ready, please retry.');
      return { ok: false };
    }

    setBusy(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Card confirmation failed.');
        return { ok: false, error: error.message };
      }

      const paymentMethodId = setupIntent?.payment_method;
      if (!paymentMethodId) {
        toast.error('Could not retrieve payment method.');
        return { ok: false };
      }

      return { ok: true, paymentMethodId };
    } finally {
      setBusy(false);
    }
  }, [stripe, elements]);

  return { confirmCard, busy };
}

/** Helper for parents that need a clientSecret before mounting <Elements>. */
export function useFetchSetupIntent() {
  const dispatch = useDispatch();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading]           = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const result = await dispatch(createSetupIntent());
    setLoading(false);
    if (createSetupIntent.fulfilled.match(result)) {
      setClientSecret(result.payload.clientSecret);
      return result.payload.clientSecret;
    }
    toast.error('Could not initialise checkout.');
    return null;
  }, [dispatch]);

  return { clientSecret, loading, fetch, reset: () => setClientSecret(null) };
}