import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { ChevronDown, Briefcase } from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_FILTER_TABS } from '../../constants/jobConstants';
import { CardSkeleton } from '../../components/feedback';
import {
  PageHeader, StatTileGroup, Toolbar, TabBar, EmptyState,
} from '../../components/ui';
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

  const hasFilters = !!(query || filterType !== 'all' || filterDiscipline || filterLocation);
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

  const typeCounts = JOB_FILTER_TABS.reduce((acc, t) => ({
    ...acc,
    [t.id]: t.id === 'all' ? activeJobs.length : activeJobs.filter((j) => j.type === t.id).length,
  }), {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader
        variant="gradient"
        gradientFrom="#FDFCF8"
        gradientTo="#CE4F5610"
        gradientAccent="#CE4F56"
        eyebrow="Find Work"
        eyebrowColor="#CE4F56"
        title="Job Listings"
        description={`${activeJobs.length} active opportunities from studios around the world`}
      />

      <StatTileGroup
        columns={3}
        tiles={[
          { label: 'Direct Hire',     value: activeJobs.filter((j) => j.type === 'hire').length,            color: 'text-[#2DA4D6]' },
          { label: 'Swaps',           value: activeJobs.filter((j) => j.type === 'swap').length,            color: 'text-[#E89560]' },
          { label: 'Energy Exchange', value: activeJobs.filter((j) => j.type === 'energy_exchange').length, color: 'text-[#6B6B66]' },
        ]}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search title, discipline, location...',
        }}
        advanced={{
          open: showFilters,
          onToggle: () => setShowFilters((v) => !v),
          hasActive: hasFilters,
          accent: '#CE4F56',
          toggleLabel: 'Filters',
          children: (
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                  Discipline
                </label>
                <div className="relative">
                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#CE4F56] pr-8"
                  >
                    <option value="">All disciplines</option>
                    {allDisciplines.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                  Location
                </label>
                <input
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="e.g. Bali, Europe, Thailand..."
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56]"
                />
              </div>
            </div>
          ),
        }}
        resultCount={hasFilters ? filtered.length : null}
        resultNoun="listing"
        onClear={hasFilters ? clearFilters : null}
        hasActiveFilters={hasFilters}
      >
        <TabBar
          variant="pill"
          tabs={JOB_FILTER_TABS}
          activeId={filterType}
          onChange={setFilterType}
          counts={typeCounts}
        />
      </Toolbar>

      {loading && <CardSkeleton count={4} />}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Briefcase}
            title="No listings found"
            message="Try adjusting your search or filters"
            action={(
              <button onClick={clearFilters} className="text-sm text-[#CE4F56] hover:underline">
                Clear filters
              </button>
            )}
          />
        </div>
      )}

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
