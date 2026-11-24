import { useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

import { Modal, Button } from '../../components/ui';
import { BOOST_CONFIG } from '../../constants/growConstants';
import { GrowStripePaymentControls } from './GrowPaymentModal';

export default function BoostPaymentModal({ open, post, onCancel, onPaid, role = 'instructor' }) {
  const [working, setWorking] = useState(false);
  if (!open || !post) return null;

  return (
    <Modal
      open
      size="sm"
      title={BOOST_CONFIG.label}
      onClose={working ? undefined : onCancel}
      dismissOnBackdrop={!working}
      zIndex="z-[60]"
      footer={<Button variant="secondary" onClick={onCancel} disabled={working}>Cancel</Button>}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5FDA6] flex items-center justify-center flex-shrink-0">
            <Zap size={18} />
          </div>
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">{post.title}</p>
            <p className="text-xs text-[#6B6B66] mt-2">{BOOST_CONFIG.blurb} One-off payment—not a subscription.</p>
          </div>
        </div>

        <GrowStripePaymentControls
          purpose="boost"
          amount={BOOST_CONFIG.price}
          postId={post.id}
          role={role}
          onBusyChange={setWorking}
          ctaLabel={`Pay $${BOOST_CONFIG.price} & Boost`}
          onSuccess={({ post: updatedPost }) => {
            toast.success('Payment successful—your post is boosted for 7 days.');
            onPaid?.({ post: updatedPost });
          }}
        />
      </div>
    </Modal>
  );
}
