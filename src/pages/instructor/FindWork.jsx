import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, MapPin, Calendar, Clock, Briefcase, RefreshCw, Zap,
  X, Filter, ChevronDown, MessageCircle, Bookmark, BookmarkCheck,
  Users, GraduationCap, Check, XCircle, Clock3,
} from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';

// ── Enum → label maps (kept in sync with JobListings form) ───────
const ROLE_TYPE_LABELS = {
  permanent:     'Permanent',
  temporary:     'Temporary',
  substitute:    'Substitute',
  weekend_cover: 'Substitute for the weekend',
  casual:        'Casual / On-call',
};

const QUALIFICATION_LABELS = {
  none:                 'Not required',
  intermediate:         'Intermediate / High School',
  diploma:              'Diploma / Associate',
  bachelors:            "Bachelor's Degree",
  masters:              "Master's Degree",
  doctorate:            'Doctorate / PhD',
  cert_200hr:           '200hr Teacher Certification',
  cert_500hr:           '500hr Teacher Certification',
  cert_comprehensive:   'Comprehensive Certification',
  cert_specialized:     'Specialised / Other Certification',
};

const JOB_TYPES = [
  { id: 'all',             label: 'All Listings',    color: '#CCFF00', bg: 'bg-[#CCFF00]', activeText: '#3E3D38' },
  { id: 'hire',            label: 'Direct Hire',     color: '#2DA4D6', bg: 'bg-[#2DA4D6]', activeText: '#FFFFFF' },
  { id: 'swap',            label: 'Instructor Swap', color: '#E89560', bg: 'bg-[#E89560]', activeText: '#FFFFFF' },
  { id: 'energy_exchange', label: 'Energy Exchange', color: '#6BE6A4', bg: 'bg-[#6BE6A4]', activeText: '#3E3D38' },
];

const TYPE_STYLES = {
  hire:            { icon: Briefcase, color: '#2DA4D6', bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]', label: 'Direct Hire' },
  swap:            { icon: RefreshCw, color: '#E89560', bg: 'bg-[#E89560]/15', text: 'text-[#E89560]', label: 'Instructor Swap' },
  energy_exchange: { icon: Zap,       color: '#6BE6A4', bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]', label: 'Energy Exchange' },
};

// Format a date into the compact "Jul 24, 2026" style the app uses elsewhere.
const formatShortDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return ''; }
};

/**
 * Given the `application` object that the backend attaches per job
 * (or null), return what the Apply button should render.
 *
 * Button states the UI cares about:
 *   none            — never applied / withdrawn / rejection lock expired
 *   pending         — applied, studio hasn't opened it
 *   viewed          — studio opened it, no decision
 *   accepted        — studio accepted
 *   rejected_locked — studio rejected, still inside 3-month window
 *   rejected_open   — studio rejected, lock expired, can re-apply
 */
const getApplyState = (application) => {
  if (!application || application.status === 'withdrawn') return 'none';
  if (application.status === 'accepted') return 'accepted';
  if (application.status === 'rejected') {
    return application.can_reapply_at ? 'rejected_locked' : 'rejected_open';
  }
  return application.status; // pending | viewed
};

export default function FindWork() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { jobs, status, applyingJobId } = useSelector((s) => s.job);

  const [query,            setQuery]            = useState('');
  const [filterType,       setFilterType]       = useState('all');
  const [showFilters,      setShowFilters]      = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterLocation,   setFilterLocation]   = useState('');
  const [savedJobs,        setSavedJobs]        = useState([]);
  const [applyTarget,      setApplyTarget]      = useState(null);
  const [applyMessage,     setApplyMessage]     = useState('');

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const activeJobs = useMemo(() => jobs.filter((j) => j.is_active !== false), [jobs]);

  const allDisciplines = useMemo(() => (
    [...new Set(activeJobs.flatMap((j) => j.disciplines || []))].sort()
  ), [activeJobs]);

  const filtered = useMemo(() => {
    return activeJobs.filter((job) => {
      const q = query.toLowerCase();
      const matchQ = !q
        || job.title?.toLowerCase().includes(q)
        || job.description?.toLowerCase().includes(q)
        || job.location?.toLowerCase().includes(q)
        || (job.disciplines || []).some((d) => d.toLowerCase().includes(q));
      const matchType = filterType === 'all' || job.type === filterType;
      const matchD = !filterDiscipline
        || (job.disciplines || []).some((d) => d.toLowerCase().includes(filterDiscipline.toLowerCase()));
      const matchL = !filterLocation
        || job.location?.toLowerCase().includes(filterLocation.toLowerCase());
      return matchQ && matchType && matchD && matchL;
    });
  }, [activeJobs, query, filterType, filterDiscipline, filterLocation]);

  const clearFilters = () => {
    setQuery(''); setFilterType('all');
    setFilterDiscipline(''); setFilterLocation('');
  };
  const hasFilters = query || filterType !== 'all' || filterDiscipline || filterLocation;

  const toggleSaveJob = (id) => {
    setSavedJobs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const openApplyModal = (job) => {
    setApplyTarget(job);
    setApplyMessage('');
  };

  const submitApply = async () => {
    if (!applyTarget) return;
    const result = await dispatch(applyToJob({
      jobId:   applyTarget.id,
      message: applyMessage.trim() || null,
    }));
    setApplyTarget(null);
    setApplyMessage('');
    if (applyToJob.fulfilled.match(result)) {
      toast.success('Application sent — the studio will be in touch.');
    } else {
      // Backend returns a human-friendly error string for the reject lock;
      // surface it verbatim so instructors know the unlock date.
      toast.error(result.payload || 'Could not send application.');
    }
  };

  const loading = status === STATUS.LOADING && jobs.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 rounded-2xl p-6 border border-[#E5E0D8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, #CE4F56 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-[#CE4F56] text-xs font-semibold tracking-widest uppercase mb-2">Find Work</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">Job Listings</h1>
          <p className="text-[#6B6B66] text-sm">
            {activeJobs.length} active opportunities from studios around the world
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Direct Hire',     count: activeJobs.filter((j) => j.type === 'hire').length,            color: 'text-[#2DA4D6]' },
          { label: 'Swaps',           count: activeJobs.filter((j) => j.type === 'swap').length,            color: 'text-[#E89560]' },
          { label: 'Energy Exchange', count: activeJobs.filter((j) => j.type === 'energy_exchange').length, color: 'text-[#6B6B66]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
            <p className={`font-['Unbounded'] text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-[#9A9A94] text-xs font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, location, discipline..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${showFilters ? 'bg-[#CE4F56] border-[#CE4F56] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56]'}`}>
            <Filter size={14} /> Filters
            {hasFilters && filterType === 'all' && <span className="w-2 h-2 rounded-full bg-[#CE4F56]" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => (
            <button key={t.id} onClick={() => setFilterType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${filterType === t.id ? 'shadow-sm' : 'bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E6FF80]'}`}
              style={filterType === t.id ? { backgroundColor: t.color, color: t.activeText } : {}}>
              {t.label}
              {t.id !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({activeJobs.filter((j) => j.type === t.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E0D8]">
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Discipline</label>
              <div className="relative">
                <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#CE4F56] pr-8">
                  <option value="">All disciplines</option>
                  {allDisciplines.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Location</label>
              <input value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="e.g. Bali, Europe, Thailand..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56]" />
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
            <p className="text-[#9A9A94] text-xs">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
            <button onClick={clearFilters} className="text-xs text-[#CE4F56] hover:underline flex items-center gap-1">
              <X size={11} /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading && <CardSkeleton count={4} />}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <Briefcase size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">No listings found</p>
          <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-[#CE4F56] hover:underline">Clear filters</button>
        </div>
      )}

      {/* Job cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => {
            const typeInfo = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
            const TypeIcon = typeInfo.icon;
            const isSaved  = savedJobs.includes(job.id);
            const isApplying = applyingJobId === job.id;
            const applyState = getApplyState(job.application);
            const userDisciplines = user?.disciplines || user?.detail?.disciplines || [];
            const isMatch = userDisciplines.some((d) => (job.disciplines || []).includes(d));

            return (
              <div key={job.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:border-[#CE4F56]/30 hover:shadow-sm transition-all">
                <div className="p-6">

                  {/* Top row */}
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
                          <p className="text-[#9A9A94] text-xs mt-0.5">
                            {job.studio?.name || job.studio?.detail?.studioName || 'Posted by a studio on Moving Guru'}
                          </p>
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
                          <button onClick={() => toggleSaveJob(job.id)}
                            className={`p-1.5 rounded-lg transition-all ${isSaved ? 'text-[#CE4F56]' : 'text-[#C4BCB4] hover:text-[#CE4F56]'}`}
                            title={isSaved ? 'Remove from saved' : 'Save listing'}>
                            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#6B6B66] text-sm leading-relaxed line-clamp-3 mb-4">
                    {job.description}
                  </p>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {job.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <MapPin size={12} className="text-[#9A9A94]" />
                        {job.location}
                      </div>
                    )}
                    {job.start_date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <Calendar size={12} className="text-[#9A9A94]" />
                        From {job.start_date}
                      </div>
                    )}
                    {job.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <Clock size={12} className="text-[#9A9A94]" />
                        {job.duration}
                      </div>
                    )}
                    {job.compensation && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E3D38]">
                        💰 {job.compensation}
                      </div>
                    )}
                    {(job.applicants_count || 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
                        <Users size={12} />
                        {job.applicants_count} applied
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  {job.requirements && (
                    <div className="bg-[#FBF8E4] rounded-xl px-4 py-2.5 mb-4">
                      <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Requirements</p>
                      <p className="text-[#6B6B66] text-xs leading-relaxed">{job.requirements}</p>
                    </div>
                  )}

                  {/* Disciplines */}
                  {(job.disciplines || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.disciplines.map((d) => (
                        <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA row */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
                    {isMatch && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">
                        ✓ Matches your disciplines
                      </div>
                    )}
                    <div className="flex-1" />
                    <button onClick={() => toggleSaveJob(job.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all
                        ${isSaved
                          ? 'border-[#CE4F56] text-[#CE4F56] bg-[#CE4F56]/5'
                          : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#CE4F56]'}`}>
                      {isSaved ? <><BookmarkCheck size={13} /> Saved</> : <><Bookmark size={13} /> Save</>}
                    </button>

                    <ApplyButton
                      state={applyState}
                      application={job.application}
                      isApplying={isApplying}
                      onApply={() => openApplyModal(job)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Apply modal ═══ */}
      {applyTarget && (
        <ApplyModal
          job={applyTarget}
          message={applyMessage}
          setMessage={setApplyMessage}
          submitting={applyingJobId === applyTarget.id}
          onClose={() => { setApplyTarget(null); setApplyMessage(''); }}
          onSubmit={submitApply}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ApplyButton — centralises the 6 possible states so the card
   markup stays tidy. Each state picks its own styling + label.
   ──────────────────────────────────────────────────────────── */
function ApplyButton({ state, application, isApplying, onApply }) {

  console.log(state)
  if (isApplying) {
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56]/80 text-white rounded-xl text-xs font-bold cursor-default">
        <ButtonLoader size={13} /> Sending...
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

  // state === 'none' (never applied / withdrawn / rejected_open)
  const label = state === 'rejected_open' ? 'Re-apply' : 'Express Interest';
  return (
    <button onClick={onApply}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56] text-white rounded-xl text-xs font-bold hover:bg-[#b8454c] transition-all">
      <MessageCircle size={13} /> {label}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
   Apply modal — cover-message form before submit.
   ──────────────────────────────────────────────────────────── */
function ApplyModal({ job, message, setMessage, submitting, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38] truncate">
              Express Interest
            </h2>
            <p className="text-[10px] text-[#9A9A94] mt-0.5 truncate">
              {job.title}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94] flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6B6B66] leading-relaxed">
            Add a short note to introduce yourself. The studio will see your full profile
            alongside your message — keep it warm and specific.
          </p>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
              Your message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Hi! I'd love to teach at your studio. Here's a bit about me and my availability..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all resize-none"
            />
            <p className="text-[10px] text-[#9A9A94] mt-1">{message.length}/2000</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#CE4F56] text-white rounded-xl text-sm font-bold hover:bg-[#b8454c] transition-all disabled:opacity-60"
          >
            {submitting ? <ButtonLoader size={14} /> : <MessageCircle size={14} />}
            Send Application
          </button>
        </div>
      </div>
    </div>
  );
}