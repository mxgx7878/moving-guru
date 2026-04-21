import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Check, XCircle, MessageCircle, MapPin, Clock, Users, Loader2,
  ExternalLink, Star, UserCheck,
} from 'lucide-react';
import {
  fetchJobApplicants,
  updateApplicationStatus,
} from '../../store/actions/jobAction';
import { fetchUserReviews } from '../../store/actions/reviewAction';
import { STATUS } from '../../constants/apiConstants';
import { Modal, Button, StarRating } from '../../components/ui';
import ReviewFormModal from './ReviewFormModal';

// Tone + label for each status the studio can land an applicant in.
const STATUS_STYLES = {
  pending:  { label: 'New',      bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]' },
  viewed:   { label: 'Viewed',   bg: 'bg-[#FBF8E4]',    text: 'text-[#6B6B66]' },
  accepted: { label: 'Hired',    bg: 'bg-emerald-50',   text: 'text-emerald-600' },
  rejected: { label: 'Declined', bg: 'bg-red-50',       text: 'text-red-500' },
};

export default function JobApplicantsModal({ job, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicantsByJobId, mutatingApplicationId } = useSelector((s) => s.job);
  const reviewsByUserId = useSelector((s) => s.review.byUserId);

  const bucket = (job && applicantsByJobId[job.id]) || {};
  const applicants = bucket.applicants || [];
  const freshJob = bucket.job || job;
  const loading = bucket.status === STATUS.LOADING;

  const vacancies = freshJob?.vacancies || 1;
  const filled = freshJob?.positions_filled || 0;
  const canHire = filled < vacancies;

  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    if (job?.id) dispatch(fetchJobApplicants(job.id));
  }, [job?.id, dispatch]);

  useEffect(() => {
    applicants.forEach((app) => {
      const id = app.instructor?.id;
      if (id && !reviewsByUserId[id]) {
        dispatch(fetchUserReviews({ userId: id, direction: 'studio_to_instructor' }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicants.length]);

  if (!job) return null;

  const handleAccept = (app) => {
    if (!canHire) return;
    dispatch(updateApplicationStatus({
      applicationId: app.id,
      jobId: job.id,
      status: 'accepted',
    }));
  };

  const handleReject = (app) => {
    dispatch(updateApplicationStatus({
      applicationId: app.id,
      jobId: job.id,
      status: 'rejected',
    }));
  };

  const handleMessage = () => {
    onClose();
    navigate('/studio/messages');
  };

  const handleViewProfile = (instructorId) => {
    if (!instructorId) return;
    onClose();
    navigate(`/studio/instructors/${instructorId}`);
  };

  return (
    <>
      <Modal
        open
        size="xl"
        zIndex="z-[60]"
        onClose={onClose}
        title="Applicants"
        subtitle={`For ${job.title}`}
        bodyClassName="p-0"
        footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
      >
        <div className="px-6 py-3 border-b border-[#E5E0D8] flex items-center justify-between">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
              ${canHire ? 'bg-[#2DA4D6]/10 text-[#2DA4D6]' : 'bg-emerald-50 text-emerald-600'}`}
          >
            <UserCheck size={10} />
            {filled} of {vacancies} filled
          </span>
        </div>

        {!canHire && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 text-xs text-emerald-700">
            All vacancies filled — this listing is now closed. You can still decline or message remaining applicants.
          </div>
        )}

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading && applicants.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#2DA4D6]" />
            </div>
          )}

          {!loading && applicants.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="text-[#C4BCB4] mx-auto mb-3" />
              <p className="text-[#3E3D38] font-semibold text-sm">No applicants yet</p>
              <p className="text-[#9A9A94] text-xs mt-1">
                Instructors who apply to this listing will appear here.
              </p>
            </div>
          )}

          {applicants.length > 0 && (
            <div className="space-y-3">
              {applicants.map((app) => (
                <ApplicantCard
                  key={app.id}
                  app={app}
                  reviewSummary={reviewsByUserId[app.instructor?.id]?.summary}
                  isMutating={mutatingApplicationId === app.id}
                  canHire={canHire}
                  onViewProfile={() => handleViewProfile(app.instructor?.id)}
                  onMessage={handleMessage}
                  onAccept={() => handleAccept(app)}
                  onReject={() => handleReject(app)}
                  onReview={() => setReviewTarget({ user: app.instructor, jobId: job.id, jobTitle: job.title })}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {reviewTarget && (
        <ReviewFormModal
          reviewee={reviewTarget.user}
          jobListingId={reviewTarget.jobId}
          jobTitle={reviewTarget.jobTitle}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </>
  );
}

function ApplicantCard({ app, reviewSummary, isMutating, canHire, onViewProfile, onMessage, onAccept, onReject, onReview }) {
  const inst = app.instructor || {};
  const detail = inst.detail || {};
  const initials = (inst.name || '?')
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const style = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
  const disciplines = detail.disciplines || inst.disciplines || [];
  const avatar = detail.profile_picture_url || detail.profile_picture;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 hover:border-[#2DA4D6]/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] overflow-hidden flex-shrink-0">
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] truncate">
              {inst.name || 'Unknown'}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            {reviewSummary && reviewSummary.count > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBF8E4] text-[#3E3D38]">
                <Star size={10} className="text-[#E89560]" fill="#E89560" />
                {reviewSummary.average.toFixed(1)}
                <span className="text-[#9A9A94]">({reviewSummary.count})</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {detail.location && (
              <span className="flex items-center gap-1 text-[11px] text-[#6B6B66]">
                <MapPin size={10} /> {detail.location}
              </span>
            )}
            {app.created_at && (
              <span className="flex items-center gap-1 text-[11px] text-[#9A9A94]">
                <Clock size={10} />
                {new Date(app.created_at).toLocaleDateString()}
              </span>
            )}
            {reviewSummary && reviewSummary.count > 0 && (
              <StarRating value={reviewSummary.average} size={10} />
            )}
          </div>

          {app.message && (
            <p className="mt-2 text-[#6B6B66] text-xs leading-relaxed whitespace-pre-line bg-[#FBF8E4] rounded-xl px-3 py-2">
              {app.message}
            </p>
          )}

          {disciplines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {disciplines.slice(0, 5).map((d) => (
                <span key={d} className="px-2 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                  {d}
                </span>
              ))}
              {disciplines.length > 5 && (
                <span className="text-[10px] text-[#9A9A94]">
                  +{disciplines.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
        <Button variant="secondary" size="xs" icon={ExternalLink} onClick={onViewProfile}>
          View Profile
        </Button>
        <Button variant="secondary" size="xs" icon={MessageCircle} onClick={onMessage}>
          Message
        </Button>

        <div className="flex-1" />

        {app.status === 'accepted' && (
          <Button variant="primary" size="xs" icon={Star} onClick={onReview}>
            Leave Review
          </Button>
        )}

        {(app.status === 'pending' || app.status === 'viewed') && (
          <>
            <Button
              variant="secondary"
              size="xs"
              icon={XCircle}
              loading={isMutating}
              onClick={onReject}
              className="hover:!border-red-500 hover:!text-red-500"
            >
              Decline
            </Button>
            <Button
              variant="success"
              size="xs"
              icon={Check}
              loading={isMutating}
              disabled={!canHire}
              title={!canHire ? 'All positions have been filled' : undefined}
              onClick={onAccept}
            >
              Hire
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
