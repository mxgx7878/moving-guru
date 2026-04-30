// src/features/billing/CheckoutModal.jsx
//
// CHANGE: onSuccess receives the paymentMethodId so the caller can
// pass it straight to changePlan in a single atomic backend call.

import { useState } from 'react';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

import { Modal, Button } from '../../components/ui';
import { loadStripeOnce } from '../../services/stripe';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { ROLE_THEME } from '../../config/portalConfig';

export default function CheckoutModal({
  open,
  clientSecret,
  title    = 'Add payment method',
  ctaLabel = 'Save & Continue',
  onClose,
  onSuccess,
  role     = 'instructor',
}) {
  if (!open || !clientSecret) return null;

  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  return (
    <Elements
      stripe={loadStripeOnce()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: theme.accent,
            fontFamily:   'Inter, system-ui, sans-serif',
            borderRadius: '12px',
          },
        },
      }}
    >
      <CheckoutInner
        title={title}
        ctaLabel={ctaLabel}
        accent={theme.accent}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

function CheckoutInner({ title, ctaLabel, accent, onClose, onSuccess }) {
  const { confirmCard, busy } = useStripeCheckout();
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async () => {
    const { ok, paymentMethodId } = await confirmCard();
    if (ok) onSuccess?.(paymentMethodId);
  };

  return (
    <Modal
      open
      size="md"
      title={title}
      onClose={busy ? undefined : onClose}
      dismissOnBackdrop={!busy}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button
            variant="primary"
            icon={CreditCard}
            loading={busy}
            disabled={!elementReady || busy}
            onClick={handleSubmit}
            style={{ background: accent }}
          >
            {ctaLabel}
          </Button>
        </>
      )}
    >
      <div className="space-y-4">
        {!elementReady && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 size={24} className="animate-spin text-[#9A9A94]" />
            <p className="text-xs text-[#9A9A94]">Loading payment form…</p>
          </div>
        )}

        <div className={elementReady ? '' : 'hidden'}>
          <PaymentElement
            options={{ layout: 'tabs' }}
            onReady={() => setElementReady(true)}
          />
        </div>

        {elementReady && (
          <div className="flex items-center gap-2 text-xs text-[#9A9A94]">
            <Lock size={12} />
            <span>Processed securely by Stripe. Your card details never touch our servers.</span>
          </div>
        )}
      </div>
    </Modal>
  );
}