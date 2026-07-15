import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import { createSetupIntent } from '../store/actions/subscriptionAction';
import { loadStripeOnce } from '../services/stripe';

/** Save and authenticate a card for future/off-session subscription charges. */
export function useStripeCheckout() {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const activeConfirmationRef = useRef(null);
  const confirmedSetupsRef = useRef(new Map());

  const confirmCard = useCallback(async (clientSecret) => {
    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment form not ready, please retry.');
      return { ok: false };
    }

    // Reuse the payment method if this SetupIntent already succeeded. This is
    // important when card setup completed but the following subscription API
    // request failed and the user clicks Retry.
    const cachedPaymentMethodId = confirmedSetupsRef.current.get(clientSecret);
    if (cachedPaymentMethodId) {
      return { ok: true, paymentMethodId: cachedPaymentMethodId };
    }

    // React state does not update synchronously. Two very fast clicks can reach
    // this function before `busy` disables the button, so both callers must
    // share one Stripe confirmation promise.
    if (activeConfirmationRef.current?.clientSecret === clientSecret) {
      return activeConfirmationRef.current.promise;
    }

    const confirmationPromise = (async () => {
      setBusy(true);
      try {
        // A SetupIntent can also have succeeded before this component was
        // remounted. Retrieve it first instead of confirming it a second time.
        const {
          setupIntent: existingSetupIntent,
          error: retrieveError,
        } = await stripe.retrieveSetupIntent(clientSecret);

        if (retrieveError) {
          toast.error(retrieveError.message || 'Could not check card confirmation.');
          return { ok: false, error: retrieveError.message };
        }

        if (
          existingSetupIntent?.status === 'succeeded'
          && existingSetupIntent.payment_method
        ) {
          confirmedSetupsRef.current.set(
            clientSecret,
            existingSetupIntent.payment_method,
          );
          return {
            ok: true,
            paymentMethodId: existingSetupIntent.payment_method,
          };
        }

        const card = elements.getElement(CardElement);
        if (!card) {
          toast.error('Payment form not ready, please retry.');
          return { ok: false };
        }

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

        confirmedSetupsRef.current.set(clientSecret, paymentMethodId);
        return { ok: true, paymentMethodId };
      } finally {
        setBusy(false);
      }
    })();

    activeConfirmationRef.current = {
      clientSecret,
      promise: confirmationPromise,
    };

    try {
      return await confirmationPromise;
    } finally {
      if (activeConfirmationRef.current?.promise === confirmationPromise) {
        activeConfirmationRef.current = null;
      }
    }
  }, [stripe, elements]);

  return { confirmCard, busy };
}

/**
 * Complete the first paid invoice. Stripe displays its own 3DS challenge when
 * the issuing bank requires it; ordinary cards complete without a popup.
 */
export async function confirmSubscriptionPayment(
  clientSecret,
  paymentMethodId = null,
) {
  if (!clientSecret) {
    return {
      ok: false,
      error: 'Payment confirmation is missing.',
    };
  }

  const stripe = await loadStripeOnce();

  if (!stripe) {
    return {
      ok: false,
      error: 'Stripe could not be loaded.',
    };
  }

  const confirmOptions = paymentMethodId
    ? { payment_method: paymentMethodId }
    : undefined;

  const { error, paymentIntent } =
    await stripe.confirmCardPayment(
      clientSecret,
      confirmOptions,
    );

  if (error) {
    return {
      ok: false,
      error: error.message || 'Payment confirmation failed.',
      paymentIntent,
    };
  }

  return {
    ok: paymentIntent?.status === 'succeeded',
    status: paymentIntent?.status,
    paymentIntent,
  };
}

/** Fetch a SetupIntent before mounting the CardElement modal. */
export function useFetchSetupIntent() {
  const dispatch = useDispatch();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(createSetupIntent());
      if (createSetupIntent.fulfilled.match(result)) {
        setClientSecret(result.payload.clientSecret);
        return result.payload.clientSecret;
      }
      toast.error('Could not initialise checkout.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    clientSecret,
    loading,
    fetch,
    reset: () => setClientSecret(null),
  };
}