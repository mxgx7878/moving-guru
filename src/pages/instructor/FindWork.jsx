import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, MapPin, Calendar, Clock, Briefcase, X, Filter, ChevronDown,
  MessageCircle, Bookmark, BookmarkCheck, Users, GraduationCap, Check,
  XCircle, Clock3, Lock, ExternalLink,
} from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import {
  ROLE_TYPE_LABELS, QUALIFICATION_LABELS, JOB_FILTER_TABS, TYPE_STYLES,
} from '../../constants/jobConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';
import { ApplyJobModal } from '../../features/modals';
import { getApplyState } from '../../utils/jobHelpers';
import { loadSavedJobs, saveSavedJobs, toggleSavedJob } from '../../utils/savedJobsStorage';

export default function FindWork() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { jobs, status, applyingJobId } = useSelector((s) => s.job);

  const [query,            setQuery]            = useState('');
  const [filterType,       setFilterType]       = useState('all');
  const [showFilters,      setShowFilters]      = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterLocation,   setFilterLocation]   = useState('');
  const [savedJobs,        setSavedJobs]        = useState(() => loadSavedJobs());
  const [applyTarget,      setApplyTarget]      = useState(null);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);
  useEffect(() => { saveSavedJobs(savedJobs); }, [savedJobs]);

  // Filter out inactive listings. We leave "full" listings in because
  // instructors who were already accepted still need to see them, and
  // the JobCard handles the closed state inline.
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.is_active !== false),
    [jobs],
  );

  const allDisciplines = useMemo(() => (
    [...new Set(activeJobs.flatMap((j) => j.disciplines || []))].sort()
  ), [activeJobs]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return activeJobs.filter((job) => {
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

  const hasFilters = query || filterType !== 'all' || filterDiscipline || filterLocation;

  const clearFilters = () => {
    setQuery(''); setFilterType('all');
    setFilterDiscipline(''); setFilterLocation('');
  };

  const toggleSave = (id) => setSavedJobs((prev) => toggleSavedJob(prev, id));

  const submitApply = async (message) => {
    if (!applyTarget) return;
    const result = await dispatch(applyToJob({ jobId: applyTarget.id, message }));
    setApplyTarget(null);
    if (applyToJob.fulfilled.match(result)) {
      toast.success('Application sent — the studio will be in touch.');
    } else {
      toast.error(result.payload || 'Could not send application.');
    }
  };

  const loading = status === STATUS.LOADING && jobs.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <FindWorkHeader activeCount={activeJobs.length} />
      <JobStatsRow jobs={activeJobs} />

      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        <SearchBar
          query={query}
          setQuery={setQuery}
          showFilters={showFilters}
          toggleFilters={() => setShowFilters((v) => !v)}
          hasFilters={hasFilters}
          filterTypeActive={filterType !== 'all'}
        />

        <FilterTabs
          activeId={filterType}
          onPick={setFilterType}
          jobs={activeJobs}
        />

        {showFilters && (
          <AdvancedFilters
            disciplines={allDisciplines}
            filterDiscipline={filterDiscipline}
            setFilterDiscipline={setFilterDiscipline}
            filterLocation={filterLocation}
            setFilterLocation={setFilterLocation}
          />
        )}

        {hasFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
            <p className="text-[#9A9A94] text-xs">
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
            </p>
            <button onClick={clearFilters} className="text-xs text-[#CE4F56] hover:underline flex items-center gap-1">
              <X size={11} /> Clear all
            </button>
          </div>
        )}
      </div>

      {loading && <CardSkeleton count={4} />}

      {!loading && filtered.length === 0 && <EmptyState onClear={clearFilters} />}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              user={user}
              isSaved={savedJobs.includes(job.id)}
              isApplying={applyingJobId === job.id}
              onToggleSave={() => toggleSave(job.id)}
              onApply={() => setApplyTarget(job)}
            />
          ))}
        </div>
      )}

      {applyTarget && (
        <ApplyJobModal
          job={applyTarget}
          submitting={applyingJobId === applyTarget.id}
          onClose={() => setApplyTarget(null)}
          onSubmit={submitApply}
        />
      )}
    </div>
  );
}

/* ────────────────────────────── Sub-components ────────────────────────── */

function FindWorkHeader({ activeCount }) {
  return (
    <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 rounded-2xl p-6 border border-[#E5E0D8] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, #CE4F56 0%, transparent 60%)' }} />
      <div className="relative z-10">
        <p className="text-[#CE4F56] text-xs font-semibold tracking-widest uppercase mb-2">Find Work</p>
        <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">Job Listings</h1>
        <p className="text-[#6B6B66] text-sm">
          {activeCount} active opportunities from studios around the world
        </p>
      </div>
    </div>
  );
}

function JobStatsRow({ jobs }) {
  const stats = [
    { label: 'Direct Hire',     count: jobs.filter((j) => j.type === 'hire').length,            color: 'text-[#2DA4D6]' },
    { label: 'Swaps',           count: jobs.filter((j) => j.type === 'swap').length,            color: 'text-[#E89560]' },
    { label: 'Energy Exchange', count: jobs.filter((j) => j.type === 'energy_exchange').length, color: 'text-[#6B6B66]' },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-[#E5E0D8] p-4 text-center">
          <p className={`font-['Unbounded'] text-2xl font-black ${s.color}`}>{s.count}</p>
          <p className="text-[#9A9A94] text-xs mt-1 font-semibold">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function SearchBar({ query, setQuery, showFilters, toggleFilters, hasFilters, filterTypeActive }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
        <Search size={16} className="text-[#9A9A94]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, discipline, location..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-[#9A9A94] hover:text-[#3E3D38]">
            <X size={14} />
          </button>
        )}
      </div>
      <button
        onClick={toggleFilters}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
          ${showFilters || hasFilters
            ? 'bg-[#CE4F56] text-white border-[#CE4F56]'
            : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56]'}`}
      >
        <Filter size={14} /> Filters
      </button>
    </div>
  );
}

function FilterTabs({ activeId, onPick, jobs }) {
  return (
    <div className="flex flex-wrap gap-2">
      {JOB_FILTER_TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick(t.id)}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all
            ${activeId === t.id ? 'shadow-sm' : 'bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E6FF80]'}`}
          style={activeId === t.id ? { backgroundColor: t.color, color: t.activeText } : {}}
        >
          {t.label}
          {t.id !== 'all' && (
            <span className="ml-1.5 opacity-70">
              ({jobs.filter((j) => j.type === t.id).length})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function AdvancedFilters({
  disciplines, filterDiscipline, setFilterDiscipline,
  filterLocation, setFilterLocation,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E0D8]">
      <div>
        <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Discipline</label>
        <div className="relative">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#CE4F56] pr-8"
          >
            <option value="">All disciplines</option>
            {disciplines.map((d) => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Location</label>
        <input
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          placeholder="e.g. Bali, Europe, Thailand..."
          className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56]"
        />
      </div>
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
      <Briefcase size={32} className="text-[#C4BCB4] mx-auto mb-3" />
      <p className="text-[#3E3D38] font-semibold">No listings found</p>
      <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your search or filters</p>
      <button onClick={onClear} className="mt-4 text-sm text-[#CE4F56] hover:underline">Clear filters</button>
    </div>
  );
}

export function JobCard({ job, user, isSaved, isApplying, onToggleSave, onApply }) {
  const typeInfo = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
  const TypeIcon = typeInfo.icon;
  // Pass the whole job so getApplyState can factor in capacity state.
  const applyState = getApplyState(job);
  const userDisciplines = user?.disciplines || user?.detail?.disciplines || [];
  const isMatch = userDisciplines.some((d) => (job.disciplines || []).includes(d));

  const vacancies = job.vacancies || 1;
  const filled = job.positions_filled || 0;
  const isFull = applyState === 'full';

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${isFull ? 'border-[#E5E0D8] opacity-85' : 'border-[#E5E0D8] hover:border-[#CE4F56]/30 hover:shadow-sm'}`}>
      {/* Capacity banner when full */}
      {isFull && (
        <div className="bg-[#FBF8E4] border-b border-[#E5E0D8] px-6 py-2 flex items-center gap-2 text-xs text-[#6B6B66]">
          <Lock size={12} />
          <span className="font-semibold">Position filled — this listing is no longer accepting applications.</span>
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
                <button onClick={onToggleSave}
                  className={`p-1.5 rounded-lg transition-all ${isSaved ? 'text-[#CE4F56]' : 'text-[#C4BCB4] hover:text-[#CE4F56]'}`}
                  title={isSaved ? 'Remove from saved' : 'Save listing'}>
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
            {job.disciplines.map((d) => (
              <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-[#E5E0D8] flex-wrap">
          {isMatch && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">
              ✓ Matches your disciplines
            </div>
          )}
          {/* Vacancy indicator — helps instructor see at-a-glance whether
              they're applying to a 1-person gig or a team hire */}
          {vacancies > 1 && !isFull && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] bg-[#2DA4D6]/10 text-[#2DA4D6] px-3 py-1.5 rounded-full">
              <Users size={12} /> {filled} of {vacancies} filled
            </div>
          )}
          <div className="flex-1" />
          <button onClick={onToggleSave}
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
  );
}

function ApplyButton({ state, application, isApplying, onApply }) {
  if (isApplying) {
    return (
      <button disabled
        className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56]/80 text-white rounded-xl text-xs font-bold cursor-default">
        <ButtonLoader size={13} /> Sending...
      </button>
    );
  }

  // New state — listing has filled all vacancies / is inactive.
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

  // none | rejected_open
  const label = state === 'rejected_open' ? 'Re-apply' : 'Express Interest';
  return (
    <button onClick={onApply}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56] text-white rounded-xl text-xs font-bold hover:bg-[#b8454c] transition-all">
      <MessageCircle size={13} /> {label}
    </button>
  );
}