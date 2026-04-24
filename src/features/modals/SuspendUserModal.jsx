import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Modal, Button, RHFInput } from '../../components/ui';
import { reasonSchema } from '../forms';

// Dialog used by AdminUsers to capture a suspension reason before
// calling the suspend API. Now validated via yup so we don't hit the
// backend with an empty string.
export default function SuspendUserModal({ onCancel, onConfirm, busy = false }) {
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
      title="Suspend Account"
      subtitle="Suspended users can't log in until reactivated."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" loading={busy} onClick={handleSubmit(submit)}>
            Suspend
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
          placeholder="Reason (e.g. policy violation, spam reports)..."
          accent="#7F77DD"
        />
      </form>
    </Modal>
  );
}
