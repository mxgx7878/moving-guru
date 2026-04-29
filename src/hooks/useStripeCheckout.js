import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import { createSetupIntent, attachPaymentMethod } from '../store/actions/subscriptionAction';

/**
 * Single-purpose hook that wraps SetupIntent creation + card confirmation.
 * Caller passes onCardSaved(paymentMethodId) to perform the next action
 * (subscribe, swap plan, retry payment, etc).
 */
export function useStripeCheckout() {
  const dispatch  = useDispatch();
  const stripe    = useStripe();
  const elements  = useElements();
  const [busy, setBusy] = useState(false);

  const confirmAndAttach = useCallback(async ({ onCardSaved } = {}) => {
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

      const attachResult = await dispatch(attachPaymentMethod(paymentMethodId));
      if (attachPaymentMethod.rejected.match(attachResult)) {
        toast.error('Could not save card. Please try again.');
        return { ok: false };
      }

      if (onCardSaved) await onCardSaved(paymentMethodId);
      return { ok: true, paymentMethodId };
    } finally {
      setBusy(false);
    }
  }, [stripe, elements, dispatch]);

  return { confirmAndAttach, busy };
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