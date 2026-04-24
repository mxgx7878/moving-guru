import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MessageCircle } from 'lucide-react';

import { Modal, Button, RHFInput } from '../../components/ui';
import { applyJobSchema } from '../forms';

// Apply / "Express Interest" modal used by instructors on Find Work
// and Saved Jobs. Message is optional but should be meaningful when
// provided (see applyJobSchema).
export default function ApplyJobModal({ job, submitting, onClose, onSubmit }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(applyJobSchema),
    defaultValues: { message: '' },
  });

  const submit = ({ message }) => onSubmit((message || '').trim() || null);

  return (
    <Modal
      open
      title="Express Interest"
      subtitle={job?.title}
      size="md"
      zIndex="z-[60]"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            icon={MessageCircle}
            loading={submitting}
            onClick={handleSubmit(submit)}
          >
            Send Application
          </Button>
        </>
      }
    >
      <p className="text-xs text-ink-muted leading-relaxed mb-4">
        Add a short note to introduce yourself. The studio will see your full profile
        alongside your message — keep it warm and specific.
      </p>
      <form onSubmit={handleSubmit(submit)}>
        <RHFInput
          control={control}
          errors={errors}
          name="message"
          label="Your message (optional)"
          textarea
          rows={5}
          maxLength={1000}
          placeholder="Hi! I'd love to teach at your studio. Here's a bit about me and my availability..."
        />
      </form>
    </Modal>
  );
}
