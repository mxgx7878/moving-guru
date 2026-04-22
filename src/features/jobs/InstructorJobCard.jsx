import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, MessageCircle, Bookmark, BookmarkCheck,
  Users, GraduationCap, Check, XCircle, Clock3, Lock, ExternalLink,
} from 'lucide-react';
import { Chip } from '../../components/ui';
import { ButtonLoader } from '../../components/feedback';
import {
  ROLE_TYPE_LABELS, QUALIFICATION_LABELS, TYPE_STYLES,
} from '../../constants/jobConstants';
import { getApplyState } from '../../utils/jobHelpers';

// Job card rendered on the instructor-side feeds (Find Work + Saved Jobs).
// Renders the job description, metadata, discipline tags, and the apply
// CTA (whose state is computed from the current user's application).
export default function InstructorJobCard({
  job,
  user,
  isSaved,
  isApplying,
  onToggleSave,
  onApply,
}) {
  const typeInfo = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
  const TypeIcon = typeInfo.icon;
  const applyState = getApplyState(job);
  const userDisciplines = user?.disciplines || user?.detail?.disciplines || [];
  const isMatch = userDisciplines.some((d) => (job.disciplines || []).includes(d));

  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  const isFull    = applyState === 'full';

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${isFull ? 'border-[#E5E0D8] opacity-85' : 'border-[#E5E0D8] hover:border-[#CE4F56]/30 hover:shadow-sm'}`}>

      {isFull && (
        <div className="bg-[#FBF8E4] border-b border-[#E5E0D8] px-6 py-2 flex items-center gap-2 text-xs text-[#6B6B66]">
          <Lock size={12} />
          <span className="font-semibold">
            Position filled — this listing is no longer accepting applications.
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
            <TypeIcon size={18} style={{ color: typeInfo.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] leading-snug">
                  {job.title}
                </h3>
                {job.studio?.id ? (
                  <Link
                    to={`/portal/studios/${job.studio.id}`}
                    className="inline-flex items-center gap-1 text-[#9A9A94] text-xs mt-0.5 hover:text-[#2DA4D6] hover:underline"
                  >
                    {job.studio?.studio_name || job.studio?.name || job.studio?.detail?.studioName || 'View studio'}
                    <ExternalLink size={10} />
                  </Link>
                ) : (
                  <p className="text-[#9A9A94] text-xs mt-0.5">
                    {job.studio?.name || job.studio?.detail?.studioName || 'Posted by a studio on Moving Guru'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: typeInfo.color }}>
                  {typeInfo.label}
                </span>
                {job.role_type && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3E3D38] text-white">
                    {ROLE_TYPE_LABELS[job.role_type] || job.role_type}
                  </span>
                )}
                {job.qualification_level && job.qualification_level !== 'none' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f5fca6] text-[#3E3D38]">
                    <GraduationCap size={10} />
                    {QUALIFICATION_LABELS[job.qualification_level] || job.qualification_level}
                  </span>
                )}
                <button
                  onClick={onToggleSave}
                  className={`p-1.5 rounded-lg transition-all ${isSaved ? 'text-[#CE4F56]' : 'text-[#C4BCB4] hover:text-[#CE4F56]'}`}
                  title={isSaved ? 'Remove from saved' : 'Save listing'}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#6B6B66] text-sm leading-relaxed line-clamp-3 mb-4">
          {job.description}
        </p>

        <JobMetaRow job={job} />

        {job.requirements && (
          <div className="bg-[#FBF8E4] rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Requirements</p>
            <p className="text-[#6B6B66] text-xs leading-relaxed">{job.requirements}</p>
          </div>
        )}

        {(job.disciplines || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.disciplines.map((d) => <Chip key={d} size="xs" tone="blue">{d}</Chip>)}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
          {isMatch && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">
              ✓ Matches your disciplines
            </div>
          )}
          {vacancies > 1 && !isFull && (
            <div className="flex items-center gap-1.5 text-xs bg-[#2DA4D6]/10 text-[#2DA4D6] px-3 py-1.5 rounded-full">
              <Users size={12} /> {filled} of {vacancies} filled
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={onToggleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all
              ${isSaved
                ? 'border-[#CE4F56] text-[#CE4F56] bg-[#CE4F56]/5'
                : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#CE4F56]'}`}
          >
            {isSaved ? <><BookmarkCheck size={13} /> Saved</> : <><Bookmark size={13} /> Save</>}
          </button>
          <ApplyButton
            state={applyState}
            application={job.application}
            isApplying={isApplying}
            onApply={onApply}
          />
        </div>
      </div>
    </div>
  );
}

function JobMetaRow({ job }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {job.location && (
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
          <MapPin size={12} className="text-[#9A9A94]" /> {job.location}
        </div>
      )}
      {job.start_date && (
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
          <Calendar size={12} className="text-[#9A9A94]" /> From {job.start_date}
        </div>
      )}
      {job.duration && (
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
          <Clock size={12} className="text-[#9A9A94]" /> {job.duration}
        </div>
      )}
      {job.compensation && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E3D38]">
          💰 {job.compensation}
        </div>
      )}
      {(job.applicants_count || 0) > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
          <Users size={12} /> {job.applicants_count} applied
        </div>
      )}
    </div>
  );
}

// Apply CTA — one of six states driven by getApplyState(job):
// none | pending | viewed | accepted | rejected_open | rejected_locked | full.
function ApplyButton({ state, application, isApplying, onApply }) {
  if (isApplying) {
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56]/80 text-white rounded-xl text-xs font-bold cursor-default">
        <ButtonLoader size={13} /> Sending...
      </button>
    );
  }

  if (state === 'full') {
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-[#FBF8E4] border border-[#E5E0D8] text-[#9A9A94] rounded-xl text-xs font-bold cursor-not-allowed">
        <Lock size={13} /> Position Closed
      </button>
    );
  }

  if (state === 'accepted') {
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-default">
        <Check size={13} /> Accepted
      </button>
    );
  }

  if (state === 'pending' || state === 'viewed') {
    const label = state === 'viewed' ? 'Studio has viewed' : 'Applied';
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-[#2DA4D6]/10 border border-[#2DA4D6]/30 text-[#2DA4D6] rounded-xl text-xs font-bold cursor-default">
        <Check size={13} /> {label}
      </button>
    );
  }

  if (state === 'rejected_locked') {
    const dateStr = application?.can_reapply_at
      ? new Date(application.can_reapply_at).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric',
        })
      : 'later';
    return (
      <div className="flex flex-col items-end gap-0.5">
        <button disabled
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold cursor-not-allowed">
          <XCircle size={13} /> Not selected
        </button>
        <span className="flex items-center gap-1 text-[10px] text-[#9A9A94]">
          <Clock3 size={10} /> Can re-apply after {dateStr}
        </span>
      </div>
    );
  }

  const label = state === 'rejected_open' ? 'Re-apply' : 'Express Interest';
  return (
    <button onClick={onApply}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56] text-white rounded-xl text-xs font-bold hover:bg-[#b8454c] transition-all">
      <MessageCircle size={13} /> {label}
    </button>
  );
}
