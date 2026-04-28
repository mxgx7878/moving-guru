import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

import { fetchAdminReviews, adminDeleteReview } from '../../store/actions/reviewAction';
import { clearReviewMessage, clearReviewError } from '../../store/slices/reviewSlice';
import { STATUS } from '../../constants/apiConstants';

import {
  PageHeader, Toolbar, TabBar, DataTable, EmptyState, SelectField, Button,
} from '../../components/ui';
import { AdminReviewRow } from '../../features/reviews';
import { RemoveReviewModal } from '../../features/modals';

const PER_PAGE = 15;

const DIRECTION_TABS = [
  { id: 'all',                   label: 'All Reviews',         color: '#7F77DD' },
  { id: 'studio_to_instructor',  label: 'Studio → Instructor', color: '#2DA4D6' },
  { id: 'instructor_to_studio',  label: 'Instructor → Studio', color: '#CE4F56' },
];

const RATING_FILTERS = [
  { value: '',  label: 'All ratings' },
  { value: '5', label: '5 stars only' },
  { value: '4', label: '4 stars only' },
  { value: '3', label: '3 stars only' },
  { value: '2', label: '2 stars only' },
  { value: '1', label: '1 star only' },
];

const SORT_OPTIONS = [
  { value: 'recent',      label: 'Most recent' },
  { value: 'oldest',      label: 'Oldest first' },
  { value: 'rating_low',  label: 'Lowest rated first' },
  { value: 'rating_high', label: 'Highest rated first' },
];

const REVIEW_COLUMNS = [
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'reviewee', label: 'About' },
  { key: 'rating',   label: 'Rating' },
  { key: 'comment',  label: 'Comment' },
  { key: 'listing',  label: 'Listing' },
  { key: 'date',     label: 'Posted' },
  { key: 'actions',  label: '', align: 'right' },
];

export default function AdminReviews() {
  const dispatch = useDispatch();
  const {
    adminReviews, adminReviewsStatus, adminReviewsMeta,
    adminDeletingId, message, error,
  } = useSelector((s) => s.review);

  const [direction,     setDirection]     = useState('all');
  const [rating,        setRating]        = useState('');
  const [sort,          setSort]          = useState('recent');
  const [query,         setQuery]         = useState('');
  const [removingTarget, setRemovingTarget] = useState(null);

  const buildParams = useCallback((page = 1) => {
    const p = { page, per_page: PER_PAGE, sort };
    if (direction !== 'all') p.direction = direction;
    if (rating)              p.rating    = rating;
    if (query)               p.search    = query;
    return p;
  }, [direction, rating, sort, query]);

  // Debounced search; immediate on filter changes
  useEffect(() => {
    const debounce = query ? 350 : 0;
    const handle = setTimeout(() => {
      dispatch(fetchAdminReviews(buildParams(1)));
    }, debounce);
    return () => clearTimeout(handle);
  }, [dispatch, buildParams, query]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearReviewMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error)   { toast.error(typeof error === 'string' ? error : 'Something went wrong'); dispatch(clearReviewError()); }
  }, [error, dispatch]);

  const handleConfirmRemove = async (reason) => {
    if (!removingTarget) return;
    const id = removingTarget.id;
    setRemovingTarget(null);
    await dispatch(adminDeleteReview({ id, reason }));
  };

  const loading  = adminReviewsStatus === STATUS.LOADING && adminReviews.length === 0;
  const total    = adminReviewsMeta?.total ?? adminReviews.length;
  const hasMore  = (adminReviewsMeta?.page ?? 1) < (adminReviewsMeta?.last_page ?? 1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
    await dispatch(fetchAdminReviews({
      ...buildParams((adminReviewsMeta?.page ?? 1) + 1),
      append: true,
    }));
    setLoadingMore(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={Star}
        iconBg="#7F77DD1A"
        iconColor="#7F77DD"
        eyebrow="Admin / Reviews"
        eyebrowColor="#7F77DD"
        title="Review Moderation"
        description="Remove reviews that violate community guidelines. Use the rating filter to surface low-star reviews quickly."
      />

      <TabBar
        tabs={DIRECTION_TABS}
        activeId={direction}
        onChange={setDirection}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search by reviewer, reviewee, listing, or comment text...',
        }}
        filters={[{
          id: 'rating',
          value: rating,
          onChange: setRating,
          options: RATING_FILTERS.map((r) => ({ id: r.value, label: r.label })),
        }]}
      >
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase">
            Sort
          </span>
          <div className="min-w-[180px]">
            <SelectField
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              size="sm"
            />
          </div>
        </div>
      </Toolbar>

      <div className="text-xs text-[#9A9A94]">
        {total} review{total === 1 ? '' : 's'} match{total === 1 ? 'es' : ''} your filters
      </div>

      <DataTable
        columns={REVIEW_COLUMNS}
        rows={adminReviews}
        loading={loading}
        emptyState={(
          <EmptyState
            icon={Star}
            title="No reviews found"
            message="Try adjusting filters or search."
          />
        )}
        renderRow={(review) => (
          <AdminReviewRow
            key={review.id}
            review={review}
            busy={adminDeletingId === review.id}
            onDelete={(r) => setRemovingTarget(r)}
          />
        )}
      />

      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="md"
            loading={loadingMore}
            onClick={loadMore}
            className="hover:border-[#7F77DD] hover:text-[#7F77DD]"
          >
            Load more reviews
          </Button>
        </div>
      )}

      {removingTarget && (
        <RemoveReviewModal
          review={removingTarget}
          busy={adminDeletingId === removingTarget.id}
          onCancel={() => setRemovingTarget(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
}