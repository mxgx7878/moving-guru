import { useState } from 'react';
import { Modal, Button, Input } from '../../components/ui';

// Dialog used by AdminUsers to capture an optional suspension reason before
// actually calling the suspend API. Kept feature-local because only admin flows
// need it, but built on the shared Modal primitive.
export default function SuspendUserModal({ onCancel, onConfirm, busy = false }) {
  const [reason, setReason] = useState('');

  return (
    <Modal
      open
      size="md"
      onClose={onCancel}
      title="Suspend Account"
      subtitle="Suspended users can't log in until reactivated."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={() => onConfirm(reason.trim() || null)}
          >
            Suspend
          </Button>
        </>
      }
    >
      <Input
        textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="Reason (e.g. policy violation, spam reports)..."
        accent="#7F77DD"
      />
    </Modal>
  );
}
