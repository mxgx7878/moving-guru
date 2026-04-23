import { Zap, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button } from '../../components/ui';
import { BOOST_CONFIG } from '../../constants/growConstants';
import { processPayment } from '../../services/payments';

// One-off boost: $10 to pin a post to the top of the Grow feed for 7 days.
// Called from the "My Posts" tab of Grow. Payment is stubbed for now; when
// Stripe is connected, only processPayment() changes.
export default function BoostPaymentModal({
  open,
  post,
  onCancel,
  // Called once payment succeeds. Parent is expected to dispatch the boost
  // action to the backend (or set is_featured locally until the endpoint
  // accepts an author-paid boost).
  onPaid,
}) {
  const [working, setWorking] = useState(false);

  if (!open || !post) return null;

  const handlePay = async () => {
    setWorking(true);
    const res = await processPayment({
      kind: 'grow_boost',
      amount: BOOST_CONFIG.price,
      meta: { post_id: post.id, days: BOOST_CONFIG.days },
    });
    setWorking(false);

    if (!res.ok) {
      toast.error(res.error || 'Payment failed. Please try again.');
      return;
    }

    toast.success('Boost applied — your post is pinned for 7 days.');
    onPaid({
      post_id: post.id,
      days:    BOOST_CONFIG.days,
      price:   BOOST_CONFIG.price,
      receipt: res.receipt,
    });
  };

  return (
    <Modal
      open
      size="sm"
      title={BOOST_CONFIG.label}
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
            Pay ${BOOST_CONFIG.price}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#f5fca6] flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-[#3E3D38]" />
        </div>
        <div className="text-sm text-[#3E3D38] leading-relaxed">
          <p className="font-semibold">{post.title}</p>
          <p className="text-xs text-[#6B6B66] mt-2">
            {BOOST_CONFIG.blurb} One-off payment — not a subscription.
          </p>
        </div>
      </div>
    </Modal>
  );
}