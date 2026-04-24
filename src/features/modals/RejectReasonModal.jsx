import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Modal, Button, RHFInput } from '../../components/ui';

// Small dialog that asks the admin for a reason before rejecting a
// grow post. This variant tolerates an empty reason (the caller
// deliberately allowed this) — but when present it still has to be
// at least 5 characters so "a" doesn't slip through.
const schema = yup.object({
  reason: yup
    .string()
    .nullable()
    .test('length-or-empty', 'Reason should be at least 5 characters', (v) => {
      if (!v || !v.trim()) return true;
      return v.trim().length >= 5;
    })
    .max(500, 'Keep the reason under 500 characters'),
});

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
  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { reason: '' },
  });

  // Reset when the modal re-opens so prior input doesn't stick.
  useEffect(() => { if (open) reset({ reason: '' }); }, [open, reset]);

  if (!open) return null;

  const submit = ({ reason }) => onConfirm((reason || '').trim() || null);

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
          <Button variant="danger" size="md" onClick={handleSubmit(submit)} loading={busy}>
            {confirmLabel}
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
          placeholder={placeholder}
          accent="#7F77DD"
        />
      </form>
    </Modal>
  );
}