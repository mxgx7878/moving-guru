import { Trash2, Briefcase, MessageSquare } from 'lucide-react';
import { Avatar, IconButton, Chip } from '../../components/ui';
import StarRating from '../../components/ui/StarRating';

/**
 * AdminReviewRow
 * ─────────────────────────────────────────────────────────────
 * Single row in the admin Reviews moderation table. Both reviewer
 * and reviewee are shown (name + role chip + avatar) so the admin
 * can quickly see who-said-what-about-whom without opening a drawer.
 */
export default function AdminReviewRow({ review, busy = false, onDelete }) {
  const reviewer       = review.reviewer || {};
  const reviewee       = review.reviewee || {};
  const reviewerDetail = reviewer.detail || {};
  const revieweeDetail = reviewee.detail || {};
  const job            = review.job_listing || review.jobListing;

  const reviewerPic = reviewerDetail.profile_picture_url || reviewerDetail.profile_picture;
  const revieweePic = revieweeDetail.profile_picture_url || revieweeDetail.profile_picture;

  const created = review.created_at
    ? new Date(review.created_at).toLocaleDateString()
    : '—';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      {/* Reviewer */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <Avatar name={reviewer.name} src={reviewerPic} size="sm"
            tone={reviewer.role === 'studio' ? 'blue' : 'coral'} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#3E3D38] truncate">{reviewer.name || '—'}</p>
            <Chip size="xs" tone={reviewer.role === 'studio' ? 'blue' : 'coral'}>
              {reviewer.role}
            </Chip>
          </div>
        </div>
      </td>

      {/* Reviewee */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex items-center gap-2.5">
          <Avatar name={reviewee.name} src={revieweePic} size="sm"
            tone={reviewee.role === 'studio' ? 'blue' : 'coral'} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#3E3D38] truncate">{reviewee.name || '—'}</p>
            <Chip size="xs" tone={reviewee.role === 'studio' ? 'blue' : 'coral'}>
              {reviewee.role}
            </Chip>
          </div>
        </div>
      </td>

      {/* Rating */}
      <td className="py-3 px-4">
        <StarRating value={review.rating} size={14} readOnly />
      </td>

      {/* Comment preview */}
      <td className="py-3 px-4 max-w-[280px]">
        {review.comment ? (
          <p className="text-xs text-[#6B6B66] line-clamp-2 italic">
            "{review.comment}"
          </p>
        ) : (
          <span className="text-xs text-[#C4BCB4]">— No comment —</span>
        )}
      </td>

      {/* Listing context */}
      <td className="py-3 px-4">
        {job ? (
          <span className="flex items-center gap-1 text-[10px] text-[#6B6B66]">
            <Briefcase size={10} />
            <span className="truncate max-w-[140px]">{job.title}</span>
          </span>
        ) : <span className="text-[10px] text-[#C4BCB4]">—</span>}
      </td>

      {/* Date */}
      <td className="py-3 px-4">
        <span className="text-xs text-[#6B6B66]">{created}</span>
      </td>

      {/* Action */}
      <td className="py-3 px-4">
        <div className="flex items-center justify-end">
          <IconButton title="Remove review" onClick={() => onDelete?.(review)} tone="red" disabled={busy}>
            <Trash2 size={13} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}