import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Modal, Input, Button } from '../../components/ui';

// Build the inbox message body for a given reason. Kept in a helper so
// AdminGrowPosts can reuse it when dispatching the conversation on reject.
export const buildRejectionMessage = (reason) => {
  const base =
    "Hi — we need you to tweak your grow post before we accept it.\n\n" +
    "Go to your Grow page to alter your post and resubmit once it meets the criteria, and we'll be able to share it with our community.";
  const reasonLine = reason && reason.trim()
    ? `\n\nReason from the admin team:\n"${reason.trim()}"`
    : '';
  const tail =
    "\n\nIf you believe there's nothing wrong with the post, reply here and we'll take another look — there may be a valid reason we've missed.\n\n— GURU";
  return base + reasonLine + tail;
};

// Ask the admin for an optional reason, show a preview of exactly what will
// be sent to the author's inbox, and confirm rejection.
export default function RejectReasonModal({
  open,
  busy = false,
  title = 'Reject Post',
  description = "We'll send the author a message in their inbox with this reason.",
  confirmLabel = 'Reject & notify author',
  placeholder = 'Short reason (e.g. missing pricing, unclear location)...',
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => { if (open) setReason(''); }, [open]);

  if (!open) return null;

  const preview = buildRejectionMessage(reason);

  return (
    <Modal
      open
      size="md"
      title={title}
      subtitle={description}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={() => onConfirm(reason.trim() || null)} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Input
        textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        accent="#7F77DD"
      />

      <div className="mt-4">
        <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase flex items-center gap-1.5 mb-2">
          <Mail size={11} /> Message preview
        </p>
        <div className="bg-[#FBF8E4]/40 border border-[#E5E0D8] rounded-xl p-3 text-xs text-[#3E3D38] whitespace-pre-line leading-relaxed">
          {preview}
        </div>
        <p className="text-[10px] text-[#9A9A94] mt-2">
          Sent from <span className="font-semibold">GURU</span> to the author's inbox.
        </p>
      </div>
    </Modal>
  );
}