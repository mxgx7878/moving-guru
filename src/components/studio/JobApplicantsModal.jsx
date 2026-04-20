import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  X,
  Check,
  XCircle,
  MessageCircle,
  MapPin,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import {
  fetchJobApplicants,
  updateApplicationStatus,
} from "../../store/actions/jobAction";
import { STATUS } from "../../constants/apiConstants";
import { ButtonLoader } from "../feedback";

// Tone + label for each status the studio can land an applicant in.
const STATUS_STYLES = {
  pending: { label: "New", bg: "bg-[#2DA4D6]/10", text: "text-[#2DA4D6]" },
  viewed: { label: "Viewed", bg: "bg-[#FBF8E4]", text: "text-[#6B6B66]" },
  accepted: {
    label: "Accepted",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  rejected: { label: "Declined", bg: "bg-red-50", text: "text-red-500" },
};

/**
 * Opens when the studio clicks "View Applicants" on one of their
 * listings. Fetches applicants lazily on open.
 */
export default function JobApplicantsModal({ job, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicantsByJobId, mutatingApplicationId } = useSelector(
    (s) => s.job,
  );

  const bucket = (job && applicantsByJobId[job.id]) || {};
  const applicants = bucket.applicants || [];
  const loading = bucket.status === STATUS.LOADING;

  useEffect(() => {
    if (job?.id) dispatch(fetchJobApplicants(job.id));
  }, [job?.id, dispatch]);

  if (!job) return null;

  const handleAccept = (app) => {
    dispatch(
      updateApplicationStatus({
        applicationId: app.id,
        jobId: job.id,
        status: "accepted",
      }),
    );
  };

  const handleReject = (app) => {
    console.log("Rejecting application", app);
    console.log(job);
    dispatch(
      updateApplicationStatus({
        applicationId: app.id,
        jobId: job.id,
        status: "rejected",
      }),
    );
  };

  const handleMessage = () => {
    onClose();
    navigate("/studio/messages");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#2DA4D6]/10 flex items-center justify-center">
                <Users size={14} className="text-[#2DA4D6]" />
              </div>
              <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38] truncate">
                Applicants
              </h2>
            </div>
            <p className="text-[#9A9A94] text-xs truncate">
              For{" "}
              <span className="font-semibold text-[#3E3D38]">{job.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94] flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading && applicants.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#2DA4D6]" />
            </div>
          )}

          {!loading && applicants.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="text-[#C4BCB4] mx-auto mb-3" />
              <p className="text-[#3E3D38] font-semibold text-sm">
                No applicants yet
              </p>
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
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const style =
                  STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                const isMutating = mutatingApplicationId === app.id;
                const disciplines =
                  detail.disciplines || inst.disciplines || [];

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-4 hover:border-[#2DA4D6]/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] overflow-hidden flex-shrink-0">
                        {detail.profile_picture_url ||
                        detail.profile_picture ? (
                          <img
                            src={
                              detail.profile_picture_url ||
                              detail.profile_picture
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] truncate">
                            {inst.name || "Unknown"}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
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
                        </div>

                        {/* Message / cover letter */}
                        {app.message && (
                          <p className="mt-2 text-[#6B6B66] text-xs leading-relaxed whitespace-pre-line bg-[#FBF8E4] rounded-xl px-3 py-2">
                            {app.message}
                          </p>
                        )}

                        {/* Disciplines */}
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
                      <button
                        onClick={handleMessage}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E0D8] text-xs font-semibold text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-colors"
                      >
                        <MessageCircle size={12} /> Message
                      </button>

                      <div className="flex-1" />

                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleReject(app)}
                            disabled={isMutating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E0D8] text-xs font-semibold text-[#6B6B66] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-60"
                          >
                            {isMutating ? (
                              <ButtonLoader size={11} color="#CE4F56" />
                            ) : (
                              <XCircle size={12} />
                            )}
                            Decline
                          </button>

                          <button
                            onClick={() => handleAccept(app)}
                            disabled={isMutating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60"
                          >
                            {isMutating ? (
                              <ButtonLoader size={11} />
                            ) : (
                              <Check size={12} />
                            )}
                            Accept
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
