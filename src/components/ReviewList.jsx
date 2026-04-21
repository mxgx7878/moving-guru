import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Star } from 'lucide-react';
import { fetchUserReviews, deleteReview } from '../store/actions/reviewAction';
import { STATUS } from '../constants/apiConstants';
import { ButtonLoader, CardSkeleton } from './feedback';
import StarRating from './ui/StarRating';

/**
 * ReviewList
 * -----------------------------------------------------------------
 * Shows reviews for a given `userId`, auto-fetched on mount. Pass
 * `direction` to override role-derived default (normally the API
 * picks it based on reviewee role, so this is only needed for the
 * rare case where a user is both roles).
 *
 * `compact` variant skips the distribution bar chart (used inside
 * the instructor modal where space is tight).
 */
export default function ReviewList({ userId, direction, compact = false, emptyLabel }) {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);
  const bucket = useSelector((s) => s.review.byUserId[userId]);
  const deletingId = useSelector((s) => s.review.deletingId);

  useEffect(() => {
    if (userId) dispatch(fetchUserReviews({ userId, direction }));
  }, [userId, direction, dispatch]);

  const loading = !bucket || bucket.status === STATUS.LOADING;
  const reviews = bucket?.reviews || [];
  const summary = bucket?.summary || { count: 0, average: 0, distribution: {} };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    dispatch(deleteReview(id));
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-3">
        <CardSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#FBF8E4]/50 rounded-xl p-4 flex items-center gap-4">
        <div className="text-center">
          <p className="font-['Unbounded'] text-3xl font-black text-[#3E3D38] leading-none">
            {summary.count > 0 ? summary.average.toFixed(1) : '—'}
          </p>
          <StarRating value={summary.average} size={12} className="mt-1" />
          <p className="text-[10px] text-[#9A9A94] mt-1">
            {summary.count} review{summary.count !== 1 ? 's' : ''}
          </p>
        </div>
        {!compact && summary.count > 0 && (
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = summary.distribution?.[n] || 0;
              const pct = summary.count > 0 ? (c / summary.count) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-[10px] text-[#6B6B66]">
                  <span className="w-3 text-right">{n}</span>
                  <Star size={10} className="text-[#E89560]" fill="#E89560" />
                  <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#E89560]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-[#9A9A94]">{c}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-6 text-[#9A9A94] text-xs">
          {emptyLabel || 'No reviews yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const reviewer = r.reviewer || {};
            const initials = (reviewer.name || '?')
              .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            const isMine = currentUser?.id && reviewer.id === currentUser.id;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-[#E5E0D8] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {reviewer.detail?.profile_picture || reviewer.profile_picture ? (
                      <img
                        src={reviewer.detail?.profile_picture || reviewer.profile_picture}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-[#3E3D38]">
                          {reviewer.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={r.rating} size={11} />
                          <span className="text-[10px] text-[#9A9A94]">
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {isMine && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-lg text-[#9A9A94] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                          title="Delete your review"
                        >
                          {deletingId === r.id ? <ButtonLoader size={12} color="#CE4F56" /> : <Trash2 size={12} />}
                        </button>
                      )}
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-[#6B6B66] text-xs leading-relaxed whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}