import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../components/ui';

// Small dialog that asks the admin for an optional reason before rejecting
// a grow post. Replaces the inline reject dialog that AdminGrowPosts used
// to declare. Opens whenever `open` is true; submits the reason (or null)
// through onConfirm.
export default function RejectReasonModal({
  open,
  busy = false,
  title = 'Reject Post',
  description = 'Give the author a quick reason — this helps them resubmit correctly.',
  confirmLabel = 'Reject Post',
  placeholder = 'Optional reason (e.g. missing pricing, unclear location)...',
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  // Reset reason when the modal opens, so the previous input doesn't stick.
  useEffect(() => { if (open) setReason(''); }, [open]);

  if (!open) return null;

  const handleConfirm = () => onConfirm(reason.trim() || null);

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
          <Button variant="danger" size="md" onClick={handleConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Input
        textarea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        accent="#7F77DD"
      />
    </Modal>
  );
}
