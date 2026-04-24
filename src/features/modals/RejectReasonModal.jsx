import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail } from 'lucide-react';

import { Modal, Button, RHFInput } from '../../components/ui';

// Build the inbox message body for a given reason. Kept in a named export so
// AdminGrowPosts can reuse it when dispatching the follow-up conversation
// after a rejection succeeds.
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

// Reason is optional, but when the admin types one it must be at least
// 5 characters so a stray keystroke doesn't get sent to the author.
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
    control, handleSubmit, reset, watch, formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { reason: '' },
  });

  useEffect(() => { if (open) reset({ reason: '' }); }, [open, reset]);

  if (!open) return null;

  const submit = ({ reason }) => onConfirm((reason || '').trim() || null);
  const preview = buildRejectionMessage(watch('reason'));

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
          rows={3}
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
      </form>
    </Modal>
  );
}
