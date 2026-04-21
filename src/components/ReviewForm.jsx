import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { X, Send } from 'lucide-react';
import { createReview } from '../store/actions/reviewAction';
import { ButtonLoader } from './feedback';
import StarRating from './ui/StarRating';

/**
 * ReviewForm
 * -----------------------------------------------------------------
 * Drop-in modal that posts a review for `reviewee` (a user object
 * with at least id + name). `jobListingId` ties the review to a
 * specific listing when provided.
 *
 * Closes itself on success via onClose() so the parent doesn't need
 * extra plumbing.
 */
export default function ReviewForm({
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
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
              Leave a Review
            </h2>
            {jobTitle && (
              <p className="text-[#9A9A94] text-xs mt-0.5 truncate">
                For <span className="font-semibold text-[#3E3D38]">{jobTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg text-[#9A9A94]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Reviewee card */}
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

          {/* Rating */}
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
              Rating
            </label>
            <StarRating
              value={rating}
              interactive
              onChange={setRating}
              size={28}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
              Your feedback (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Share what the experience was like..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
            />
            <p className="text-[10px] text-[#9A9A94] text-right mt-1">
              {comment.length}/2000
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-60"
          >
            {submitting ? <ButtonLoader size={14} /> : <Send size={14} />}
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
}