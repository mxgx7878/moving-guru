import { ShieldCheck, Sprout } from 'lucide-react';
import { Modal, Button } from '../../components/ui';

// Public Grow page — blocked under-age users are pointed here for free.
// TODO: apne live public Grow page ka URL daalo (static site grow.html).
const GROW_URL = 'https://demowebportals.com/moving-guru/grow.html';

/**
 * AgeGateModal
 * ─────────────────────────────────────────────────────────────
 * Instructor registration ke dauraan dikhta hai jab entered age
 * minimum se kam ho. Account creation hard-block hoti hai (parent
 * advance/submit rok deta hai) aur visitor ko free Grow page bhejta hai.
 */
export default function AgeGateModal({ open, onClose }) {
  if (!open) return null;

  return (
    <Modal
      open
      size="md"
      title="Minimum age requirement"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Go back
          </Button>
          <Button
            variant="primary"
            icon={Sprout}
            onClick={() => window.open(GROW_URL, '_blank', 'noopener,noreferrer')}
          >
            Explore Grow
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#F5FDA6]/60 flex items-center justify-center">
            <ShieldCheck size={26} className="text-[#4E7A1B]" />
          </div>
        </div>

        <p className="text-sm text-[#3E3D38] leading-relaxed">
          We are sorry, we have a minimum age requirement at Moving Guru Collective
          so we can protect minors. When you turn 16 please come back and join our network.
        </p>

        <p className="text-sm text-[#3E3D38] leading-relaxed">
          We are glad you have an interest in Fitness and Wellness. So for now you can
          access our Grow page for free if you're looking to train in the industry and
          become qualified, attend events, or retreats.
        </p>
      </div>
    </Modal>
  );
}