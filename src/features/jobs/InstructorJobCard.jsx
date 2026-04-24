import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, MessageCircle, Bookmark, BookmarkCheck,
  Users, GraduationCap, Check, XCircle, Clock3, Lock, ExternalLink, Zap,
} from 'lucide-react';
import { Avatar, Button, Chip, IconButton } from '../../components/ui';
import {
  ROLE_TYPE_LABELS, QUALIFICATION_LABELS, TYPE_STYLES,
} from '../../constants/jobConstants';
import { formatShortDate } from '../../utils/formatters';
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
  // Primary display type + any secondary types (e.g. "Direct Hire + Swap").
  const jobTypes = Array.isArray(job.types) && job.types.length
    ? job.types
    : job.type ? [job.type] : ['hire'];
  const primaryType = jobTypes[0];
  const typeInfo = TYPE_STYLES[primaryType] || TYPE_STYLES.hire;
  const TypeIcon = typeInfo.icon;
  const applyState = getApplyState(job);
  const userDisciplines = user?.disciplines || user?.detail?.disciplines || [];
  const isMatch = userDisciplines.some((d) => (job.disciplines || []).includes(d));

  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  const isFull    = applyState === 'full';

  const studioName = job.studio?.studio_name || job.studio?.name || job.studio?.detail?.studioName;
  const studioAvatar = job.studio?.profile_picture
    || job.studio?.profile_picture_url
    || job.studio?.detail?.profile_picture
    || job.studio?.detail?.profile_picture_url;
  const openToEnergyExchange = job.open_to_energy_exchange
    ?? job.openToEnergyExchange
    ?? (job.type === 'energy_exchange');

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
          {/* Studio's own avatar leads the card — falls back to the
              listing-type tile when no picture has been uploaded. */}
          {studioAvatar ? (
            <Avatar
              name={studioName || 'Studio'}
              src={studioAvatar}
              size="md"
              tone="blue"
              className="flex-shrink-0"
            />
          ) : (
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
              <TypeIcon size={18} style={{ color: typeInfo.color }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-unbounded text-sm font-black text-[#3E3D38] leading-snug">
                  {job.title}
                </h3>
                {job.studio?.id ? (
                  <Link
                    to={`/portal/studios/${job.studio.id}`}
                    className="inline-flex items-center gap-1 text-[#9A9A94] text-xs mt-0.5 hover:text-[#2DA4D6] hover:underline"
                  >
                    {studioName || 'View studio'}
                    <ExternalLink size={10} />
                  </Link>
                ) : (
                  <p className="text-[#9A9A94] text-xs mt-0.5">
                    {studioName || 'Posted by a studio on Moving Guru'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                {/* One pill per job type — covers "Direct Hire + Swap" posts. */}
                {jobTypes.map((tid) => {
                  const info = TYPE_STYLES[tid] || TYPE_STYLES.hire;
                  return (
                    <span key={tid} className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: info.color }}>
                      {info.label}
                    </span>
                  );
                })}
                {openToEnergyExchange && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#6BE6A4]/25 text-[#3E3D38]">
                    <Zap size={10} /> Open to Energy Exchange
                  </span>
                )}
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
                <IconButton
                  variant="plain"
                  tone="coral"
                  onClick={onToggleSave}
                  title={isSaved ? 'Remove from saved' : 'Save listing'}
                  className={isSaved ? '' : '!text-ink-faint hover:!text-coral'}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </IconButton>
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
          <Button
            variant={isSaved ? 'outlineDanger' : 'secondary'}
            size="sm"
            icon={isSaved ? BookmarkCheck : Bookmark}
            onClick={onToggleSave}
            className={isSaved ? 'bg-[#CE4F56]/5' : 'hover:border-[#CE4F56] hover:text-[#CE4F56]'}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
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

// Apply CTA — one of seven states driven by getApplyState(job):
// none | pending | viewed | accepted | rejected_open | rejected_locked | full.
// Each state maps to a Button variant; `state="static"` turns the button
// into a result badge (full opacity, no cursor change).
function ApplyButton({ state, application, isApplying, onApply }) {
  if (isApplying) {
    return (
      <Button variant="danger" size="md" loading state="static">
        Sending...
      </Button>
    );
  }

  if (state === 'full') {
    return (
      <Button variant="mutedSoft" size="md" state="static" icon={Lock}>
        Position Closed
      </Button>
    );
  }

  if (state === 'accepted') {
    return (
      <Button variant="success" size="md" state="static" icon={Check}>
        Accepted
      </Button>
    );
  }

  if (state === 'pending' || state === 'viewed') {
    const label = state === 'viewed' ? 'Studio has viewed' : 'Applied';
    return (
      <Button variant="infoSoft" size="md" state="static" icon={Check}>
        {label}
      </Button>
    );
  }

  if (state === 'rejected_locked') {
    const dateStr = formatShortDate(application?.can_reapply_at) || 'later';
    return (
      <div className="flex flex-col items-end gap-0.5">
        <Button variant="dangerSoft" size="md" state="static" icon={XCircle}>
          Not selected
        </Button>
        <span className="flex items-center gap-1 text-[10px] text-[#9A9A94]">
          <Clock3 size={10} /> Can re-apply after {dateStr}
        </span>
      </div>
    );
  }

  const label = state === 'rejected_open' ? 'Re-apply' : 'Express Interest';
  return (
    <Button variant="danger" size="md" icon={MessageCircle} onClick={onApply}>
      {label}
    </Button>
  );
}
