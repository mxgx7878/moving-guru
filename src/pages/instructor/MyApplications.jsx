import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

import {
  fetchMyApplications,
  withdrawApplication,
} from '../../store/actions/jobAction';
import { fetchMyReviews } from '../../store/actions/reviewAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton } from '../../components/feedback';
import {
  Button, PageHeader, TabBar, EmptyState,
} from '../../components/ui';
import { ApplicationCard } from '../../features/applications';
import { ConfirmModal, ReviewFormModal } from '../../features/modals';

// Local-only to this page — no universal value elsewhere.
const FILTER_TABS = [
  { id: 'all',      label: 'All' },
  { id: 'pending',  label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Declined' },
];

export default function MyApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    myApplications,
    myApplicationsStatus,
    mutatingApplicationId,
  } = useSelector((s) => s.job);
  const myReviews = useSelector((s) => s.review.myReviews);

  const [reviewTarget,   setReviewTarget]   = useState(null);
  const [filter,         setFilter]         = useState('all');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
    dispatch(fetchMyReviews());
  }, [dispatch]);

  // O(1) lookup of reviews I've already posted, keyed by (reviewee, listing).
  const reviewedKeys = useMemo(() => {
    const s = new Set();
    myReviews.forEach((r) => s.add(`${r.reviewee_id}:${r.job_listing_id || 'null'}`));
    return s;
  }, [myReviews]);

  const hasReviewed = (studioId, jobId) =>
    reviewedKeys.has(`${studioId}:${jobId}`);

  const counts = useMemo(() => {
    const c = { all: myApplications.length, accepted: 0, pending: 0, rejected: 0 };
    myApplications.forEach((a) => {
      if (a.status === 'accepted') c.accepted += 1;
      else if (a.status === 'rejected') c.rejected += 1;
      else if (a.status === 'pending' || a.status === 'viewed') c.pending += 1;
    });
    return c;
  }, [myApplications]);

  const filtered = useMemo(() => {
    if (filter === 'all') return myApplications;
    if (filter === 'pending') {
      return myApplications.filter((a) => a.status === 'pending' || a.status === 'viewed');
    }
    return myApplications.filter((a) => a.status === filter);
  }, [myApplications, filter]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    const id = withdrawTarget;
    setWithdrawTarget(null);
    await dispatch(withdrawApplication(id));
  };

  const loading = myApplicationsStatus === STATUS.LOADING && myApplications.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader
        variant="gradient"
        gradientFrom="#FDFCF8"
        gradientTo="#CE4F5610"
        eyebrow="Applications"
        eyebrowColor="#CE4F56"
        title="My Applications"
        description="Track where you've applied and leave reviews for studios you've worked with"
      />

      <TabBar
        tabs={FILTER_TABS}
        activeId={filter}
        onChange={setFilter}
        counts={counts}
      />

      {loading && <CardSkeleton count={3} />}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Briefcase}
            title={myApplications.length === 0 ? "You haven't applied to anything yet" : 'No applications match this filter'}
            message={myApplications.length === 0
              ? 'Head to Find Work to see what studios are hiring for'
              : 'Try switching to a different tab'}
            action={myApplications.length === 0 && (
              <Button variant="danger" size="md" onClick={() => navigate('/portal/find-work')}>
                Find Work
              </Button>
            )}
          />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((app) => {
            const job        = app.job_listing || app.jobListing || {};
            const studio     = job.studio || {};
            const studioName = studio.name || studio.detail?.studioName || studio.studio_name || 'Studio';
            const reviewed   = hasReviewed(studio.id, job.id);

            return (
              <ApplicationCard
                key={app.id}
                app={app}
                job={job}
                studio={studio}
                studioName={studioName}
                reviewed={reviewed}
                isWithdrawing={mutatingApplicationId === app.id}
                onReview={() => setReviewTarget({
                  user:     { ...studio, name: studioName, role: 'studio' },
                  jobId:    job.id,
                  jobTitle: job.title,
                })}
                onWithdraw={() => setWithdrawTarget(app.id)}
                onMessage={() => navigate('/portal/messages')}
              />
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <ReviewFormModal
          reviewee={reviewTarget.user}
          jobListingId={reviewTarget.jobId}
          jobTitle={reviewTarget.jobTitle}
          onClose={() => setReviewTarget(null)}
        />
      )}

      {withdrawTarget && (
        <ConfirmModal
          title="Withdraw application?"
          message="You can re-apply later if the listing is still open."
          confirmLabel="Withdraw"
          loading={mutatingApplicationId === withdrawTarget}
          onCancel={() => setWithdrawTarget(null)}
          onConfirm={confirmWithdraw}
        />
      )}
    </div>
  );
}
