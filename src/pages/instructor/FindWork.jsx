import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Search, X, Filter, ChevronDown, Briefcase,
} from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_FILTER_TABS } from '../../constants/jobConstants';
import { CardSkeleton } from '../../components/feedback';
import { ApplyJobModal } from '../../features/modals';
import { InstructorJobCard } from '../../features/jobs';
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

  // "full" listings stay in the feed because accepted instructors still
  // need to see them; the card handles the closed-state UI inline.
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
        <SearchWithFilterToggle
          query={query}
          setQuery={setQuery}
          showFilters={showFilters}
          toggleFilters={() => setShowFilters((v) => !v)}
          hasFilters={hasFilters}
        />

        <TypeFilterTabs
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

      {!loading && filtered.length === 0 && <NoListings onClear={clearFilters} />}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => (
            <InstructorJobCard
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

/* ────────────────────────────── Page-local sub-components ───────────────── */

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

// Custom search row with a paired "Filters" toggle — our shared SearchBar
// doesn't include a toggle button, so we keep this page-local.
function SearchWithFilterToggle({ query, setQuery, showFilters, toggleFilters, hasFilters }) {
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

// Pill-style type filter with its own colour map per tab — different from
// the shared TabBar (rounded-xl, icon+count layout), so we keep it local.
function TypeFilterTabs({ activeId, onPick, jobs }) {
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

function NoListings({ onClear }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
      <Briefcase size={32} className="text-[#C4BCB4] mx-auto mb-3" />
      <p className="text-[#3E3D38] font-semibold">No listings found</p>
      <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your search or filters</p>
      <button onClick={onClear} className="mt-4 text-sm text-[#CE4F56] hover:underline">Clear filters</button>
    </div>
  );
}
