import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Modal, Button, RHFInput } from '../../components/ui';
import { reasonSchema } from '../forms';

// Dialog used by AdminUsers to capture a rejection reason when rejecting a
// pending signup. Pairs with SuspendUserModal — same pattern, different verb.
export default function RejectUserModal({ onCancel, onConfirm, busy = false }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(reasonSchema),
    defaultValues: { reason: '' },
  });

  const submit = ({ reason }) => onConfirm(reason.trim());

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
          <Button variant="danger" loading={busy} onClick={handleSubmit(submit)}>
            Reject Application
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)}>
        <RHFInput
          control={control}
          errors={errors}
          name="reason"
          textarea
          rows={4}
          placeholder="Reason (e.g. incomplete profile, failed verification, duplicate account)..."
          accent="#7F77DD"
        />
      </form>
    </Modal>
  );
}
