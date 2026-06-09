// src/features/billing/CheckoutModal.jsx
//
// CHANGE: PaymentElement → CardElement (card-only form).
// Sirf card number + expiry + CVC. No name/email/phone/address/postal —
// kuch collect nahi hota, isliye confirm pe kuch bhejna bhi nahi padta.
// (PaymentElement + fields:"never" forced us to supply billing details
//  manually at confirmSetup — CardElement has no such requirement.)
//
// Props contract UNCHANGED: open, clientSecret, title, ctaLabel,
// onClose, onSuccess(paymentMethodId), role.

import { useState } from "react";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { CreditCard, Lock, Loader2 } from "lucide-react";

import { Modal, Button } from "../../components/ui";
import { loadStripeOnce } from "../../services/stripe";
import { useStripeCheckout } from "../../hooks/useStripeCheckout";
import { ROLE_THEME } from "../../config/portalConfig";

// Stripe iframe styling — black text, muted placeholders, Inter font.
const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true, // ZIP/postal field bhi nahi — pure card-only
  style: {
    base: {
      fontSize: "15px",
      color: "#000000",
      fontFamily: "Inter, system-ui, sans-serif",
      "::placeholder": { color: "#9A9A94" },
      iconColor: "#6B6B66",
    },
    invalid: {
      color: "#DC2626",
      iconColor: "#DC2626",
    },
  },
};

export default function CheckoutModal({
  open,
  clientSecret,
  title = "Add payment method",
  ctaLabel = "Save & Continue",
  onClose,
  onSuccess,
  role = "instructor",
}) {
  if (!open || !clientSecret) return null;

  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  return (
    <Elements
      stripe={loadStripeOnce()}
      options={{
        // Load Inter inside Stripe's iframe so the card inputs match the app font.
        fonts: [
          {
            cssSrc:
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap",
          },
        ],
      }}
    >
      <CheckoutInner
        clientSecret={clientSecret}
        title={title}
        ctaLabel={ctaLabel}
        accent={theme.accent}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

function CheckoutInner({ clientSecret, title, ctaLabel, accent, onClose, onSuccess }) {
  const { confirmCard, busy } = useStripeCheckout();
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async () => {
    const { ok, paymentMethodId } = await confirmCard(clientSecret);
    if (ok) onSuccess?.(paymentMethodId);
  };

  return (
    <Modal
      open
      size="md"
      title={title}
      onClose={busy ? undefined : onClose}
      dismissOnBackdrop={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
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
      }
    >
      <div className="space-y-4">
        {!elementReady && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 size={24} className="animate-spin text-[#9A9A94]" />
            <p className="text-xs text-[#9A9A94]">Loading payment form…</p>
          </div>
        )}

        <div className={elementReady ? "" : "hidden"}>
          <div className="rounded-xl border border-[#E5E5E0] bg-white px-4 py-3.5">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onReady={() => setElementReady(true)}
            />
          </div>
        </div>

        {elementReady && (
          <div className="flex items-center gap-2 text-xs text-[#9A9A94]">
            <Lock size={12} />
            <span>
              Processed securely by Stripe. Your card details never touch our
              servers.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}