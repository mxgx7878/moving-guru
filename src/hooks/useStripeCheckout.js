// src/hooks/useStripeCheckout.js
//
// CHANGES:
// - confirmSetup (PaymentElement) → confirmCardSetup (CardElement).
//   SetupIntent ab SIRF card se confirm hota hai — no billing_details,
//   no confirmParams. Card SetupIntents don't require name/email/address.
// - confirmCard(clientSecret) — clientSecret ab explicitly pass hota hai
//   (CardElement flow me Elements options me clientSecret nahi jata).
//
// Return contract UNCHANGED: { ok, paymentMethodId }.

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import { createSetupIntent } from '../store/actions/subscriptionAction';

/**
 * Confirms the SetupIntent with the mounted CardElement and returns the
 * resulting paymentMethodId. Caller decides what to do next (subscribe, etc).
 */
export function useStripeCheckout() {
  const stripe   = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const confirmCard = useCallback(async (clientSecret) => {
    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment form not ready, please retry.');
      return { ok: false };
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error('Payment form not ready, please retry.');
      return { ok: false };
    }

    setBusy(true);
    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card },
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