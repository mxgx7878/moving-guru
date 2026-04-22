import { useState } from 'react';
import { Modal, Button, Input } from '../../components/ui';

// Dialog used by AdminUsers to capture a rejection reason when rejecting a
// pending signup. Pairs with SuspendUserModal — same pattern, different verb.
export default function RejectUserModal({ onCancel, onConfirm, busy = false }) {
  const [reason, setReason] = useState('');

  return (
    <Modal
      open
      size="md"
      onClose={onCancel}
      title="Reject Registration"
      subtitle="The applicant will be notified and cannot re-register with this email for 30 days."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={() => onConfirm(reason.trim() || null)}
          >
            Reject Application
          </Button>
        </>
      }
    >
      <Input
        textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="Reason (e.g. incomplete profile, failed verification, duplicate account)..."
        accent="#7F77DD"
      />
    </Modal>
  );
}