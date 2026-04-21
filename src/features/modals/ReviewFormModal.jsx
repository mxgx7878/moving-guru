import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { createReview } from '../../store/actions/reviewAction';
import { Modal, Button, Input, StarRating } from '../../components/ui';

// Reusable review-posting modal. Used by JobApplicantsModal after a hire and
// any future place where studios/instructors leave feedback.
export default function ReviewFormModal({
  reviewee,
  jobListingId,
  jobTitle,
  onClose,
}) {
  const dispatch = useDispatch();
  const submitting = useSelector((s) => s.review.submitting);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!reviewee) return null;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please pick a rating between 1 and 5 stars.');
      return;
    }
    setError('');

    const result = await dispatch(createReview({
      revieweeId: reviewee.id,
      rating,
      comment: comment.trim() || null,
      jobListingId: jobListingId || null,
    }));

    if (createReview.fulfilled.match(result)) {
      toast.success('Review posted — thank you!');
      onClose?.();
    } else {
      toast.error(result.payload || 'Could not post review.');
    }
  };

  const initials = (reviewee.name || '?')
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

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
            onClick={handleSubmit}
          >
            Post Review
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 bg-[#FBF8E4]/40 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {reviewee.profile_picture || reviewee.detail?.profile_picture ? (
              <img
                src={reviewee.profile_picture || reviewee.detail?.profile_picture}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3E3D38]">{reviewee.name}</p>
            <p className="text-[10px] text-[#9A9A94] capitalize">{reviewee.role}</p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
            Rating
          </label>
          <StarRating value={rating} interactive onChange={setRating} size={28} />
        </div>

        <Input
          textarea
          label="Your feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Share what the experience was like..."
          accent="#2DA4D6"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}
