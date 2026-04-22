import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Calendar, Clock, CheckCircle2, XCircle, Clock3,
  MessageCircle, Building2, Star, Check, Trash2,
} from 'lucide-react';

import {
  fetchMyApplications,
  withdrawApplication,
} from '../../store/actions/jobAction';
import { fetchMyReviews } from '../../store/actions/reviewAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';
import { Avatar, Button, EmptyState } from '../../components/ui';
import { ConfirmModal } from '../../features/modals';
import ReviewForm from '../../features/modals/ReviewFormModal';

/**
 * MyApplications (instructor portal)
 * -----------------------------------------------------------------
 * The instructor-side mirror of the studio's applicant management
 * view. Lists every application the instructor has sent, grouped
 * by status, with:
 *   - Pending/Viewed: withdraw button
 *   - Accepted: "Leave Review" for the studio → flips to "Reviewed"
 *     green badge once posted (or if already reviewed)
 *   - Rejected with active lock: can-reapply date
 *   - Rejected with expired lock: shown as declined but no lock info
 *
 * This closes the review loop — previously instructors could only
 * receive reviews; now they can leave them too, matching the spec
 * "instructor can give rating and review to studio".
 *
 * Route: /portal/applications
 */
export default function MyApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    myApplications,
    myApplicationsStatus,
    mutatingApplicationId,
  } = useSelector((s) => s.job);
  const myReviews = useSelector((s) => s.review.myReviews);

  const [reviewTarget, setReviewTarget] = useState(null);
  const [filter, setFilter] = useState('all');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
    dispatch(fetchMyReviews());
  }, [dispatch]);

  // O(1) lookup of reviews I've posted keyed by (reviewee, listing).
  const reviewedKeys = useMemo(() => {
    const s = new Set();
    myReviews.forEach((r) => {
      s.add(`${r.reviewee_id}:${r.job_listing_id || 'null'}`);
    });
    return s;
  }, [myReviews]);

  const hasReviewed = (studioId, jobId) =>
    reviewedKeys.has(`${studioId}:${jobId}`);

  // Bucket for the filter tabs
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
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 rounded-2xl p-6 border border-[#E5E0D8]">
        <p className="text-[#CE4F56] text-xs font-semibold tracking-widest uppercase mb-2">Applications</p>
        <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">My Applications</h1>
        <p className="text-[#6B6B66] text-sm">
          Track where you've applied and leave reviews for studios you've worked with
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterTab id="all"      label="All"      count={counts.all}      active={filter === 'all'}      onClick={setFilter} />
        <FilterTab id="pending"  label="Pending"  count={counts.pending}  active={filter === 'pending'}  onClick={setFilter} />
        <FilterTab id="accepted" label="Accepted" count={counts.accepted} active={filter === 'accepted'} onClick={setFilter} />
        <FilterTab id="rejected" label="Declined" count={counts.rejected} active={filter === 'rejected'} onClick={setFilter} />
      </div>

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
            const job = app.job_listing || app.jobListing || {};
            const studio = job.studio || {};
            const studioName = studio.name
              || studio.detail?.studioName
              || studio.studio_name
              || 'Studio';
            const reviewed = hasReviewed(studio.id, job.id);
            const isWithdrawing = mutatingApplicationId === app.id;

            return (
              <ApplicationCard
                key={app.id}
                app={app}
                job={job}
                studio={studio}
                studioName={studioName}
                reviewed={reviewed}
                isWithdrawing={isWithdrawing}
                onReview={() => setReviewTarget({
                  user: { ...studio, name: studioName, role: 'studio' },
                  jobId: job.id,
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
        <ReviewForm
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

/* ───────────────────────── Sub-components ───────────────────────── */

function FilterTab({ id, label, count, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
        ${active
          ? 'bg-[#CE4F56] text-white border border-[#CE4F56]'
          : 'bg-white border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
    >
      {label} ({count})
    </button>
  );
}

function ApplicationCard({
  app, job, studio, studioName, reviewed, isWithdrawing,
  onReview, onWithdraw, onMessage,
}) {
  const statusMeta = (() => {
    switch (app.status) {
      case 'accepted':
        return { label: 'Accepted',        bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle2 size={12} /> };
      case 'rejected':
        return { label: 'Not selected',    bg: 'bg-red-50',     text: 'text-red-500',     icon: <XCircle size={12} /> };
      case 'viewed':
        return { label: 'Studio has viewed', bg: 'bg-[#FBF8E4]',  text: 'text-[#6B6B66]',   icon: <Clock size={12} /> };
      default:
        return { label: 'Pending',         bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]',   icon: <Clock3 size={12} /> };
    }
  })();

  const appliedOn = app.created_at
    ? new Date(app.created_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  // If the application is a "rejected_locked" case, tell the instructor
  // when they can try again — mirrors the Find Work button copy.
  const canReapplyAt = app.can_reapply_at
    ? new Date(app.can_reapply_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 hover:border-[#CE4F56]/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar
          name={studioName}
          src={studio.detail?.profile_picture || studio.profile_picture}
          size="md"
          shape="square"
          tone="blue"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] truncate">
              {job.title || 'Untitled listing'}
            </p>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
              {statusMeta.icon} {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] mt-1 flex-wrap">
            <Building2 size={11} className="text-[#9A9A94]" />
            <span className="font-semibold">{studioName}</span>
            {job.location && (
              <>
                <span className="text-[#C4BCB4]">·</span>
                <MapPin size={11} className="text-[#9A9A94]" />
                <span>{job.location}</span>
              </>
            )}
            {appliedOn && (
              <>
                <span className="text-[#C4BCB4]">·</span>
                <Calendar size={11} className="text-[#9A9A94]" />
                <span className="text-[#9A9A94]">Applied {appliedOn}</span>
              </>
            )}
          </div>

          {/* Lock info for rejected applications */}
          {app.status === 'rejected' && canReapplyAt && (
            <p className="mt-2 text-[11px] text-[#9A9A94] flex items-center gap-1">
              <Clock3 size={10} /> You can re-apply after {canReapplyAt}.
            </p>
          )}

          {/* My original message — collapsed */}
          {app.message && (
            <details className="mt-2">
              <summary className="text-[11px] text-[#9A9A94] cursor-pointer hover:text-[#6B6B66]">
                View your message
              </summary>
              <p className="mt-1 text-[#6B6B66] text-xs leading-relaxed whitespace-pre-line bg-[#FBF8E4] rounded-xl px-3 py-2">
                {app.message}
              </p>
            </details>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
        <button
          onClick={onMessage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E0D8] text-xs font-semibold text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-colors"
        >
          <MessageCircle size={12} /> Message
        </button>

        <div className="flex-1" />

        {/* Review button / Reviewed badge — only for accepted apps,
            mirrors the studio-side modal exactly. */}
        {app.status === 'accepted' && reviewed && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold cursor-default"
            title="You've already reviewed this studio for this listing"
          >
            <Check size={12} /> Reviewed
          </span>
        )}
        {app.status === 'accepted' && !reviewed && studio.id && (
          <button
            onClick={onReview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#CE4F56] text-white text-xs font-bold hover:bg-[#b8454c] transition-colors"
          >
            <Star size={12} /> Leave Review
          </button>
        )}

        {/* Withdraw — available while the application is still active */}
        {(app.status === 'pending' || app.status === 'viewed') && (
          <button
            onClick={onWithdraw}
            disabled={isWithdrawing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E0D8] text-xs font-semibold text-[#6B6B66] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-60"
          >
            {isWithdrawing ? <ButtonLoader size={11} color="#CE4F56" /> : <Trash2 size={11} />}
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}