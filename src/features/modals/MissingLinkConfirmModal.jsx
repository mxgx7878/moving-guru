import { Link2Off } from 'lucide-react';
import { Modal, Button } from '../../components/ui';

// Shown on Grow post submit when the author left `external_url` empty.
// The copy is the exact wording the client asked for — do not paraphrase
// without client sign-off.
export default function MissingLinkConfirmModal({
  open,
  onCancel,       // "Go back" — let me add a link
  onConfirm,      // "Submit without link" — proceed anyway
}) {
  if (!open) return null;

  return (
    <Modal
      open
      size="md"
      title="You haven't included a link"
      onClose={onCancel}
      zIndex="z-[60]"
      footer={
        <>
          <Button variant="primary" onClick={onCancel}>
            Go back & add a link
          </Button>
          <Button variant="secondary" onClick={onConfirm}>
            Submit without a link
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FBF8E4] flex items-center justify-center flex-shrink-0">
          <Link2Off size={18} className="text-[#E89560]" />
        </div>
        <div className="text-sm text-[#3E3D38] leading-relaxed">
          <p>You have not included a link to your event.</p>
          <p className="mt-2">
            Are you sure you want to proceed without a link? A link will allow
            your participants to purchase tickets or get further information
            about your event, training, or retreat.
          </p>
        </div>
      </div>
    </Modal>
  );
}