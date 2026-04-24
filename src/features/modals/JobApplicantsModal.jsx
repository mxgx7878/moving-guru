import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  X, Check, XCircle, MessageCircle, MapPin, Clock, Users, Loader2,
  ExternalLink, Star, UserCheck,
} from "lucide-react";
import {
  fetchJobApplicants,
  updateApplicationStatus,
} from "../../store/actions/jobAction";
import { fetchUserReviews, fetchMyReviews } from "../../store/actions/reviewAction";
import { STATUS } from "../../constants/apiConstants";
import { ButtonLoader } from "../../components/feedback";
import { Button, IconButton } from "../../components/ui";
import  StarRating  from "../../components/ui/StarRating";
import ReviewFormModal from "./ReviewFormModal";

// Tone + label for each status the studio can land an applicant in.
const STATUS_STYLES = {
  pending:  { label: "New",      bg: "bg-[#2DA4D6]/10", text: "text-[#2DA4D6]" },
  viewed:   { label: "Viewed",   bg: "bg-[#FBF8E4]",    text: "text-[#6B6B66]" },
  accepted: { label: "Hired",    bg: "bg-emerald-50",   text: "text-emerald-600" },
  rejected: { label: "Declined", bg: "bg-red-50",       text: "text-red-500" },
};

/**
 * JobApplicantsModal
 * -----------------------------------------------------------------
 * Studio-facing modal listing applicants for a single listing.
 *
 * Review UX
 * -----------------------------------------------------------------
 * Once a studio has hired an applicant, they get a "Leave Review" CTA.
 * After the review is posted (or if they've already reviewed this
 * instructor for this listing in the past), the CTA is replaced by
 * a disabled green "Reviewed" badge so the studio can't double-submit
 * and can see at a glance who still needs feedback.
 *
 * The duplicate check is a two-layer belt-and-braces:
 *   1. Client-side via `state.review.myReviews` (fetched on mount).
 *   2. Server-side via a unique index on (reviewer, reviewee, listing).
 *
 * When ReviewForm closes after a successful post, the slice has
 * already unshifted the new review into `myReviews`, so the badge
 * flips without another round-trip.
 */
export default function JobApplicantsModal({ job, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicantsByJobId, mutatingApplicationId } = useSelector((s) => s.job);
  const reviewsByUserId = useSelector((s) => s.review.byUserId);
  const myReviews = useSelector((s) => s.review.myReviews);

  const bucket = (job && applicantsByJobId[job.id]) || {};
  const applicants = bucket.applicants || [];
  const freshJob   = bucket.job || job;
  const loading    = bucket.status === STATUS.LOADING;

  const vacancies = freshJob?.vacancies || 1;
  const filled    = freshJob?.positions_filled || 0;
  const canHire   = filled < vacancies;

  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    if (job?.id) dispatch(fetchJobApplicants(job.id));
    // Keep myReviews fresh so the "already reviewed" badge is accurate
    // even on the first open after a reload.
    dispatch(fetchMyReviews());
  }, [job?.id, dispatch]);

  // Pre-fetch review summaries for visible applicants.
  //
  // Effect runs only when the applicant id-set changes (derived stably via
  // useMemo), not every time the review cache fills. We read the latest
  // `reviewsByUserId` through a ref so we don't fire the same fetches
  // again each render — previously silenced with eslint-disable.
  const reviewsByUserIdRef = useRef(reviewsByUserId);
  useEffect(() => { reviewsByUserIdRef.current = reviewsByUserId; }, [reviewsByUserId]);

  const applicantIdsKey = useMemo(
    () => applicants.map((a) => a.instructor?.id).filter(Boolean).join(','),
    [applicants],
  );

  useEffect(() => {
    applicantIdsKey.split(',').filter(Boolean).forEach((raw) => {
      const id = Number(raw);
      if (!reviewsByUserIdRef.current[id]) {
        dispatch(fetchUserReviews({ userId: id, direction: 'studio_to_instructor' }));
      }
    });
  }, [applicantIdsKey, dispatch]);

  // Build an O(1) lookup of (revieweeId, jobListingId) pairs I've
  // already reviewed, so the per-applicant render is cheap.
  const reviewedKeys = useMemo(() => {
    const s = new Set();
    myReviews.forEach((r) => {
      s.add(`${r.reviewee_id}:${r.job_listing_id || 'null'}`);
    });
    return s;
  }, [myReviews]);

  const hasReviewed = (instructorId) =>
    reviewedKeys.has(`${instructorId}:${job.id}`);

  if (!job) return null;

  const handleAccept = (app) => {
    if (!canHire) return;
    dispatch(updateApplicationStatus({
      applicationId: app.id,
      jobId: job.id,
      status: "accepted",
    }));
  };

  const handleReject = (app) => {
    dispatch(updateApplicationStatus({
      applicationId: app.id,
      jobId: job.id,
      status: "rejected",
    }));
  };

  const handleMessage = () => {
    onClose();
    navigate("/studio/messages");
  };

  const handleViewProfile = (instructorId) => {
    if (!instructorId) return;
    onClose();
    navigate(`/studio/instructors/${instructorId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#2DA4D6]/10 flex items-center justify-center">
                <Users size={14} className="text-[#2DA4D6]" />
              </div>
              <h2 className="font-unbounded text-base font-black text-[#3E3D38] truncate">
                Applicants
              </h2>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${canHire ? 'bg-[#2DA4D6]/10 text-[#2DA4D6]' : 'bg-emerald-50 text-emerald-600'}`}
              >
                <UserCheck size={10} />
                {filled} of {vacancies} filled
              </span>
            </div>
            <p className="text-[#9A9A94] text-xs truncate">
              For <span className="font-semibold text-[#3E3D38]">{job.title}</span>
            </p>
          </div>
          <IconButton
            variant="plain"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="flex-shrink-0"
          >
            <X size={18} />
          </IconButton>
        </div>

        {!canHire && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 text-xs text-emerald-700">
            All vacancies filled — this listing is now closed. You can still decline or message remaining applicants.
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
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
              {applicants.map((app) => {
                const inst = app.instructor || {};
                const detail = inst.detail || {};
                const initials = (inst.name || "?")
                  .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const style = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                const isMutating = mutatingApplicationId === app.id;
                const disciplines = detail.disciplines || inst.disciplines || [];
                const reviewBucket = reviewsByUserId[inst.id];
                const reviewSummary = reviewBucket?.summary || null;
                const alreadyReviewed = hasReviewed(inst.id);

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-4 hover:border-[#2DA4D6]/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-unbounded overflow-hidden flex-shrink-0">
                        {detail.profile_picture_url || detail.profile_picture ? (
                          <img
                            src={detail.profile_picture_url || detail.profile_picture}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-unbounded text-sm font-black text-[#3E3D38] truncate">
                            {inst.name || "Unknown"}
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
                              <span
                                key={d}
                                className="px-2 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full"
                              >
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

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
                      <Button variant="secondary" size="xs" icon={ExternalLink}
                        onClick={() => handleViewProfile(inst.id)}
                        className="hover:border-[#2DA4D6] hover:text-[#2DA4D6]">
                        View Profile
                      </Button>
                      <Button variant="secondary" size="xs" icon={MessageCircle}
                        onClick={handleMessage}
                        className="hover:border-[#2DA4D6] hover:text-[#2DA4D6]">
                        Message
                      </Button>

                      <div className="flex-1" />

                      {/* "Reviewed" badge wins over "Leave Review" even when
                          status != 'accepted' — legacy data may have slipped
                          through, so we show the record instead of nothing. */}
                      {app.status === "accepted" && alreadyReviewed && (
                        <Button variant="successSoft" size="xs" icon={Check} state="static"
                          title="You've already reviewed this instructor for this listing">
                          Reviewed
                        </Button>
                      )}
                      {app.status === "accepted" && !alreadyReviewed && (
                        <Button variant="primary" size="xs" icon={Star}
                          onClick={() => setReviewTarget({ user: inst, jobId: job.id, jobTitle: job.title })}>
                          Leave Review
                        </Button>
                      )}

                      {(app.status === "pending" || app.status === "viewed") && (
                        <>
                          <Button variant="secondary" size="xs" icon={XCircle}
                            onClick={() => handleReject(app)}
                            disabled={isMutating}
                            loading={isMutating}
                            className="hover:border-red-500 hover:text-red-500">
                            Decline
                          </Button>

                          <Button variant="success" size="xs" icon={Check}
                            onClick={() => handleAccept(app)}
                            disabled={isMutating || !canHire}
                            loading={isMutating}
                            title={!canHire ? 'All positions have been filled' : undefined}>
                            Hire
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>Close</Button>
        </div>
      </div>

      {reviewTarget && (
        <ReviewFormModal
          reviewee={reviewTarget.user}
          jobListingId={reviewTarget.jobId}
          jobTitle={reviewTarget.jobTitle}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}