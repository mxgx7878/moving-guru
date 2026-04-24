import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

import { createReview } from '../../store/actions/reviewAction';
import { Modal, Button, Avatar, RHFInput, StarRating } from '../../components/ui';
import { reviewSchema } from '../forms';

// Reusable review-posting modal. Used by JobApplicantsModal after a hire
// and any future place where studios/instructors leave feedback.
export default function ReviewFormModal({
  reviewee,
  jobListingId,
  jobTitle,
  onClose,
}) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.review.submitting);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const rating = watch('rating');

  if (!reviewee) return null;

  const submit = async ({ rating, comment }) => {
    const result = await dispatch(createReview({
      revieweeId: reviewee.id,
      rating,
      comment: (comment || '').trim() || null,
      jobListingId: jobListingId || null,
    }));

    if (createReview.fulfilled.match(result)) {
      toast.success('Review posted — thank you!');
      onClose?.();
    } else {
      toast.error(result.payload || 'Could not post review.');
    }
  };

  const profilePicture = reviewee.detail?.profile_picture_url
    || reviewee.detail?.profile_picture
    || reviewee.profile_picture_url
    || reviewee.profile_picture;

  return (
    <Modal
      open
      size="md"
      zIndex="z-[70]"
      onClose={onClose}
      title="Leave a Review"
      subtitle={jobTitle ? `For ${jobTitle}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={Send}
            loading={submitting}
            disabled={rating < 1}
            onClick={handleSubmit(submit)}
          >
            Post Review
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div className="flex items-center gap-3 bg-cream/40 rounded-xl p-3">
          <Avatar name={reviewee.name} src={profilePicture} size="md" tone="coral" />
          <div>
            <p className="text-sm font-semibold text-ink">{reviewee.name}</p>
            <p className="text-[10px] text-ink-soft capitalize">{reviewee.role}</p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">
            Rating
          </label>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating value={field.value} interactive onChange={field.onChange} size={28} />
            )}
          />
          {errors.rating && (
            <p className="text-xs text-red-500 mt-2">{errors.rating.message}</p>
          )}
        </div>

        <RHFInput
          control={control}
          errors={errors}
          name="comment"
          textarea
          label="Your feedback (optional)"
          rows={4}
          maxLength={1000}
          placeholder="Share what the experience was like..."
          accent="#2DA4D6"
        />
      </form>
    </Modal>
  );
}
