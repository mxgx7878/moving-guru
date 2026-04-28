import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Modal, Button, RHFInput, Chip } from '../../components/ui';
import StarRating from '../../components/ui/StarRating';

const removeReviewSchema = yup.object({
  reason: yup.string().trim().max(1000, 'Reason must be 1000 characters or less'),
});

/**
 * RemoveReviewModal
 * ─────────────────────────────────────────────────────────────
 * Confirms the destructive removal of a review with a brief
 * preview of what's being deleted (rating + comment + reviewer
 * → reviewee) and an optional reason captured for audit.
 */
export default function RemoveReviewModal({ review, busy = false, onCancel, onConfirm }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(removeReviewSchema),
    defaultValues: { reason: '' },
  });

  const submit = ({ reason }) => onConfirm(reason.trim());

  if (!review) return null;

  const reviewer = review.reviewer || {};
  const reviewee = review.reviewee || {};

  return (
    <Modal
      open
      size="md"
      onClose={onCancel}
      title="Remove this review?"
      subtitle="This cannot be undone. The reviewer can post a new review for the same listing if appropriate."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" loading={busy} onClick={handleSubmit(submit)}>
            Remove Review
          </Button>
        </>
      }
    >
      <div className="bg-[#FDFCF8] rounded-xl border border-[#E5E0D8] p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold">
          <span>{reviewer.name}</span>
          <Chip size="xs" tone={reviewer.role === 'studio' ? 'blue' : 'coral'}>
            {reviewer.role}
          </Chip>
          <span>→</span>
          <span>{reviewee.name}</span>
          <Chip size="xs" tone={reviewee.role === 'studio' ? 'blue' : 'coral'}>
            {reviewee.role}
          </Chip>
        </div>
        <StarRating value={review.rating} size={16} readOnly />
        {review.comment && (
          <p className="text-xs text-[#6B6B66] italic">"{review.comment}"</p>
        )}
      </div>

      <form onSubmit={handleSubmit(submit)}>
        <RHFInput
          control={control}
          errors={errors}
          name="reason"
          label="Reason (optional)"
          textarea
          rows={3}
          placeholder="e.g. Hate speech, defamation, spam, off-topic content..."
          accent="#7F77DD"
        />
      </form>
    </Modal>
  );
}