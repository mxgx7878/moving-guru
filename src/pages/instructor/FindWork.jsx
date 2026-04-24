import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Briefcase, Lock, MapPin, Calendar, Heart, Users } from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { fetchInstructors } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_FILTER_TABS } from '../../constants/jobConstants';
import { ALL_DISCIPLINES } from '../../data/disciplines';
import { COUNTRIES } from '../../data/countries';
import { CardSkeleton } from '../../components/feedback';
import {
  PageHeader, StatTileGroup, Toolbar, TabBar, EmptyState, SelectField, Input, Button, Avatar,
} from '../../components/ui';
import { ApplyJobModal } from '../../features/modals';
import { InstructorJobCard } from '../../features/jobs';
import { loadSavedJobs, saveSavedJobs, toggleSavedJob } from '../../utils/savedJobsStorage';

// Instructor helper — returns true if the user has "Swaps" in their
// openTo list (supports both snake_case + camelCase API shapes).
const isOpenToSwap = (u) => {
  const list = u?.open_to || u?.openTo || u?.detail?.open_to || u?.detail?.openTo || [];
  return Array.isArray(list) && list.some((v) => /swap|swop/i.test(v));
};

export default function FindWork() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { jobs, status, applyingJobId } = useSelector((s) => s.job);
  const { instructors, status: instructorsStatus } = useSelector((s) => s.instructor);

  const [query,            setQuery]            = useState('');
  const [filterType,       setFilterType]       = useState('all');
  const [showFilters,      setShowFilters]      = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterCountry,    setFilterCountry]    = useState('');
  const [filterCity,       setFilterCity]       = useState('');
  const [filterSuburb,     setFilterSuburb]     = useState('');
  const [savedJobs,        setSavedJobs]        = useState(() => loadSavedJobs());
  const [applyTarget,      setApplyTarget]      = useState(null);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchInstructors());
  }, [dispatch]);
  useEffect(() => { saveSavedJobs(savedJobs); }, [savedJobs]);

  const viewerOpenToSwap = isOpenToSwap(user);

  // Active studio job listings.
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.is_active !== false),
    [jobs],
  );

  // Instructors open to swap (excluding the current user). Visibility
  // rule: only surface these when the *viewing* instructor is also
  // open to swap — otherwise the feed stays job-only.
  const swapInstructors = useMemo(() => {
    if (!viewerOpenToSwap) return [];
    return (instructors || []).filter((i) => (
      i.id !== user?.id && isOpenToSwap(i)
    ));
  }, [instructors, viewerOpenToSwap, user?.id]);

  // Location filter helper — matches any of city / country / suburb /
  // location / traveling_to fields on the feed item.
  const matchesLocation = (item) => {
    if (!filterCountry && !filterCity && !filterSuburb) return true;
    const haystack = [
      item.location, item.country, item.city, item.suburb,
      item.travelingTo, item.traveling_to, item.country_from,
    ].filter(Boolean).join(' ').toLowerCase();
    if (filterCountry && !haystack.includes(filterCountry.toLowerCase())) return false;
    if (filterCity    && !haystack.includes(filterCity.toLowerCase()))    return false;
    if (filterSuburb  && !haystack.includes(filterSuburb.toLowerCase()))  return false;
    return true;
  };

  const jobMatchesQuery = (job) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return job.title?.toLowerCase().includes(q)
      || job.description?.toLowerCase().includes(q)
      || job.location?.toLowerCase().includes(q)
      || (job.disciplines || []).some((d) => d.toLowerCase().includes(q));
  };

  const instructorMatchesQuery = (inst) => {
    const q = query.toLowerCase();
    if (!q) return true;
    const detail = inst.detail || {};
    return (inst.name || '').toLowerCase().includes(q)
      || (detail.location || inst.location || '').toLowerCase().includes(q)
      || (detail.bio || '').toLowerCase().includes(q)
      || (detail.disciplines || inst.disciplines || []).some((d) => d.toLowerCase().includes(q));
  };

  const filteredJobs = useMemo(() => activeJobs.filter((job) => {
    const types = Array.isArray(job.types) && job.types.length ? job.types : [job.type];
    const matchTypeFilter = filterType === 'all' || types.includes(filterType);
    const matchD = !filterDiscipline
      || (job.disciplines || []).some((d) => d.toLowerCase() === filterDiscipline.toLowerCase());
    return matchTypeFilter && matchD && matchesLocation(job) && jobMatchesQuery(job);
  }), [activeJobs, filterType, filterDiscipline, filterCountry, filterCity, filterSuburb, query]);

  const filteredInstructors = useMemo(() => {
    if (filterType !== 'all' && filterType !== 'swap') return [];
    return swapInstructors.filter((inst) => {
      const detail = inst.detail || {};
      const disc = detail.disciplines || inst.disciplines || [];
      const matchD = !filterDiscipline
        || disc.some((d) => d.toLowerCase() === filterDiscipline.toLowerCase());
      return matchD && matchesLocation({ ...inst, ...detail }) && instructorMatchesQuery(inst);
    });
  }, [swapInstructors, filterType, filterDiscipline, filterCountry, filterCity, filterSuburb, query]);

  const hasFilters = !!(
    query || filterType !== 'all' || filterDiscipline
    || filterCountry || filterCity || filterSuburb
  );
  const clearFilters = () => {
    setQuery(''); setFilterType('all');
    setFilterDiscipline('');
    setFilterCountry(''); setFilterCity(''); setFilterSuburb('');
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

  const loading = (status === STATUS.LOADING && jobs.length === 0)
    || (instructorsStatus === STATUS.LOADING && instructors.length === 0);

  const typeCounts = JOB_FILTER_TABS.reduce((acc, t) => {
    if (t.id === 'all') {
      acc[t.id] = activeJobs.length + (viewerOpenToSwap ? swapInstructors.length : 0);
    } else if (t.id === 'swap') {
      const jobSwapCount = activeJobs.filter((j) => {
        const types = Array.isArray(j.types) && j.types.length ? j.types : [j.type];
        return types.includes('swap');
      }).length;
      acc[t.id] = jobSwapCount + (viewerOpenToSwap ? swapInstructors.length : 0);
    } else {
      acc[t.id] = activeJobs.filter((j) => {
        const types = Array.isArray(j.types) && j.types.length ? j.types : [j.type];
        return types.includes(t.id);
      }).length;
    }
    return acc;
  }, {});

  const totalResults = filteredJobs.length + filteredInstructors.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader
        variant="gradient"
        gradientFrom="#FDFCF8"
        gradientTo="#CE4F5610"
        gradientAccent="#CE4F56"
        eyebrow="Find Work"
        eyebrowColor="#CE4F56"
        title="Job Listings & Instructor Swaps"
        description={
          viewerOpenToSwap
            ? `${activeJobs.length} studio listings + ${swapInstructors.length} instructors open to swap`
            : `${activeJobs.length} active studio opportunities — enable "Swaps" in your profile to also see other instructors`
        }
      />

      <StatTileGroup
        columns={3}
        tiles={[
          { label: 'Direct Hire', value: activeJobs.filter((j) => {
              const types = Array.isArray(j.types) && j.types.length ? j.types : [j.type];
              return types.includes('hire');
            }).length, color: 'text-[#2DA4D6]' },
          { label: 'Swaps', value: activeJobs.filter((j) => {
              const types = Array.isArray(j.types) && j.types.length ? j.types : [j.type];
              return types.includes('swap');
            }).length + (viewerOpenToSwap ? swapInstructors.length : 0), color: 'text-[#E89560]' },
          { label: 'Open to Energy Exchange', value: activeJobs.filter((j) => (
              j.open_to_energy_exchange || j.openToEnergyExchange || j.type === 'energy_exchange'
            )).length, color: 'text-[#6B6B66]' },
        ]}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search title, discipline, location, instructor name...',
        }}
        advanced={{
          open: showFilters,
          onToggle: () => setShowFilters((v) => !v),
          hasActive: hasFilters,
          accent: '#CE4F56',
          toggleLabel: 'Filters',
          children: (
            <div className="grid md:grid-cols-2 gap-3">
              <SelectField
                label="Discipline"
                value={filterDiscipline}
                onChange={setFilterDiscipline}
                options={ALL_DISCIPLINES}
                placeholder="All disciplines"
                size="sm"
              />
              <SelectField
                label="Country"
                value={filterCountry}
                onChange={setFilterCountry}
                options={COUNTRIES}
                placeholder="Any country"
                size="sm"
              />
              <Input
                label="City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="e.g. Sydney, Bali"
              />
              <Input
                label="Suburb"
                value={filterSuburb}
                onChange={(e) => setFilterSuburb(e.target.value)}
                placeholder="e.g. Bondi, Canggu"
              />
            </div>
          ),
        }}
        resultCount={hasFilters ? totalResults : null}
        resultNoun="result"
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

      {!loading && totalResults === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Briefcase}
            title="No listings found"
            message="Try adjusting your search or filters"
            action={(
              <Button variant="ghost" size="sm" onClick={clearFilters} className="!text-coral hover:!underline">
                Clear filters
              </Button>
            )}
          />
        </div>
      )}

      {!loading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <InstructorJobCard
              key={`job-${job.id}`}
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

      {!loading && filteredInstructors.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <h3 className="font-unbounded text-sm font-black text-[#3E3D38]">Instructors Open to Swaps</h3>
            <span className="text-xs text-[#9A9A94]">({filteredInstructors.length})</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredInstructors.map((inst) => (
              <InstructorSwapCard
                key={`inst-${inst.id}`}
                inst={inst}
                onOpen={() => navigate(`/portal/instructors/${inst.id}`)}
              />
            ))}
          </div>
        </>
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

// Lightweight card showing another instructor who is open to swap.
// Clicks through to the shared InstructorDetail page.
function InstructorSwapCard({ inst, onOpen }) {
  const detail = inst.detail || {};
  const disciplines = detail.disciplines || inst.disciplines || [];
  const location = detail.location || inst.location;
  const travelingTo = detail.travelingTo || detail.traveling_to;
  const avatar = detail.profile_picture_url || detail.profile_picture || inst.profile_picture;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white rounded-2xl border border-[#E5E0D8] p-5 hover:border-[#E89560] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={inst.name} src={avatar} size="md" tone="coral" />
        <div className="min-w-0">
          <p className="font-unbounded text-sm font-black text-[#3E3D38] truncate">{inst.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-bold bg-[#E89560]/15 text-[#E89560] px-2 py-0.5 rounded-full">
              Open to Swap
            </span>
          </div>
        </div>
      </div>

      {disciplines.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {disciplines.slice(0, 3).map((d) => (
            <span key={d} className="text-[10px] bg-[#2DA4D6]/10 text-[#2DA4D6] px-2 py-0.5 rounded-full">{d}</span>
          ))}
          {disciplines.length > 3 && (
            <span className="text-[10px] bg-[#FBF8E4] text-[#9A9A94] px-2 py-0.5 rounded-full">
              +{disciplines.length - 3}
            </span>
          )}
        </div>
      )}

      {(location || travelingTo) && (
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
          <MapPin size={11} className="text-[#9A9A94]" />
          <span>{location || '—'}</span>
          {travelingTo && <> → <span className="font-medium">{travelingTo}</span></>}
        </div>
      )}
    </button>
  );
}
