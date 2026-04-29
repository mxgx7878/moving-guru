import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';

import { Modal, Button } from '../../components/ui';
import { loadStripeOnce } from '../../services/stripe';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { ROLE_THEME } from '../../config/portalConfig';

/**
 * Reusable Stripe checkout. Mounts <PaymentElement /> against a clientSecret
 * (SetupIntent). On submit, attaches the card to the customer, then calls
 * onSuccess() — caller decides what to do next (subscribe, swap plan, etc).
 */
export default function CheckoutModal({
  open,
  clientSecret,
  title       = 'Add payment method',
  ctaLabel    = 'Save & Continue',
  onClose,
  onSuccess,
  role        = 'instructor',
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
  const { confirmAndAttach, busy } = useStripeCheckout();

  const handleSubmit = async () => {
    const { ok, paymentMethodId } = await confirmAndAttach();
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
            onClick={handleSubmit}
            style={{ background: accent }}
          >
            {ctaLabel}
          </Button>
        </>
      )}
    >
      <div className="space-y-4">
        <PaymentElement options={{ layout: 'tabs' }} />
        <div className="flex items-center gap-2 text-xs text-[#9A9A94]">
          <Lock size={12} />
          <span>Payments are processed securely by Stripe. Your card details never touch our servers.</span>
        </div>
      </div>
    </Modal>
  );
}