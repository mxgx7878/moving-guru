import { useState } from 'react';
import { CheckCircle2, CreditCard, Clock } from 'lucide-react';
import { Modal, Button } from '../../components/ui';
import { GROW_PRICING_TIERS } from '../../constants/growConstants';
import { processPayment } from '../../services/payments';
import { toast } from 'sonner';

// Payment gate shown on first submission of a Grow post. Author picks a
// duration tier; we charge the matching price and stamp the post's
// expiry_date. Edits within the live window skip this modal entirely.
//
// When real payments are wired up, only processPayment() needs to change —
// this component stays as-is.
export default function GrowPaymentModal({
  open,
  onCancel,
  // Called with { tier, days, price, expiry_date } once payment succeeds.
  onPaid,
}) {
  const [tierId, setTierId] = useState(GROW_PRICING_TIERS[0].id);
  const [working, setWorking] = useState(false);

  const tier = GROW_PRICING_TIERS.find((t) => t.id === tierId) || GROW_PRICING_TIERS[0];

  const handlePay = async () => {
    setWorking(true);
    const res = await processPayment({
      kind: 'grow_post',
      amount: tier.price,
      meta: { tier: tier.id, days: tier.days },
    });
    setWorking(false);

    if (!res.ok) {
      toast.error(res.error || 'Payment failed. Please try again.');
      return;
    }

    // Compute expiry date = now + tier.days (ISO yyyy-mm-dd to match the API).
    const d = new Date();
    d.setDate(d.getDate() + tier.days);
    const expiry = d.toISOString().slice(0, 10);

    toast.success('Payment successful — submitting your post for approval.');
    onPaid({
      tier:         tier.id,
      days:         tier.days,
      price:        tier.price,
      expiry_date:  expiry,
      receipt:      res.receipt,
    });
  };

  if (!open) return null;

  return (
    <Modal
      open
      size="md"
      title="Choose your post duration"
      subtitle="One-off payment. Edits within this window are free."
      onClose={working ? undefined : onCancel}
      dismissOnBackdrop={!working}
      zIndex="z-[60]"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={working}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={CreditCard}
            loading={working}
            onClick={handlePay}
          >
            Pay ${tier.price} & Submit
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {GROW_PRICING_TIERS.map((t) => {
          const selected = t.id === tierId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTierId(t.id)}
              className={`w-full flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors
                ${selected
                  ? 'border-[#2DA4D6] bg-[#2DA4D6]/5'
                  : 'border-[#E5E0D8] hover:border-[#3E3D38]'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center
                  ${selected ? 'border-[#2DA4D6] bg-[#2DA4D6]' : 'border-[#E5E0D8]'}`}>
                  {selected && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div>
                  <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">
                    {t.label}
                  </p>
                  <p className="text-xs text-[#6B6B66] mt-0.5 flex items-center gap-1">
                    <Clock size={11} className="text-[#9A9A94]" />
                    {t.blurb}
                  </p>
                </div>
              </div>
              <p className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">
                ${t.price}
              </p>
            </button>
          );
        })}

        <p className="text-[11px] text-[#9A9A94] pt-2 leading-relaxed">
          Your post will be submitted for review after payment. Once approved
          it goes live for the duration you selected. You can edit for free
          at any time while it's live — every edit is reviewed before the
          updated version is published.
        </p>
      </div>
    </Modal>
  );
}