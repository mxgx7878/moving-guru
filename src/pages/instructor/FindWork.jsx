import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Briefcase, Users, Search, X, SlidersHorizontal, RefreshCw,
} from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { fetchInstructors } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_FILTER_TABS } from '../../constants/jobConstants';
import { ALL_DISCIPLINES } from '../../data/disciplines';
import { COUNTRIES } from '../../data/countries';
import { CardSkeleton } from '../../components/feedback';
import {
  TabBar, EmptyState, SelectField, Input, Button,
  IconButton, Chip, LazyVisible,
} from '../../components/ui';
import { ApplyJobModal } from '../../features/modals';
import { InstructorJobCard } from '../../features/jobs';
import { InstructorSwapCard } from '../../features/instructors';
import {
  loadSavedJobs, saveSavedJobs, toggleSavedJob,
} from '../../utils/savedJobsStorage';

const PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: 'recent',    label: 'Most recent' },
  { value: 'oldest',    label: 'Oldest first' },
  { value: 'name_asc',  label: 'Title A → Z' },
  { value: 'name_desc', label: 'Title Z → A' },
];

export default function FindWork() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { jobs, status: jobsStatus, applyingJobId, jobsMeta } = useSelector((s) => s.job);
  const {
    instructors, status: swapsStatus, pagination: instructorsMeta,
  } = useSelector((s) => s.instructor);

  // ── View toggle (jobs ↔ swaps) ───────────────────────────────
  const myOpenTo   = user?.openTo || user?.open_to || [];
  const iOfferSwap = myOpenTo.includes('Swaps');
  const [view, setView] = useState('jobs');               // 'jobs' | 'swaps'

  // If user toggles off swap availability, force them back to jobs
  useEffect(() => {
    if (!iOfferSwap && view === 'swaps') setView('jobs');
  }, [iOfferSwap, view]);

  const viewIsSwaps = view === 'swaps';

  // ── Filter / sort state (pushed to backend) ──────────────────
  const [query,            setQuery]            = useState('');
  const [filterType,       setFilterType]       = useState('all');
  const [showFilters,      setShowFilters]      = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterCountry,    setFilterCountry]    = useState('');
  const [filterCity,       setFilterCity]       = useState('');
  const [filterSuburb,     setFilterSuburb]     = useState('');
  const [sort,             setSort]             = useState('recent');

  const [savedJobs,        setSavedJobs]        = useState(() => loadSavedJobs());
  const [applyTarget,      setApplyTarget]      = useState(null);
  const [loadingMore,      setLoadingMore]      = useState(false);

  // ── Build query params ───────────────────────────────────────
  const buildJobParams = useCallback((page = 1) => {
    const p = { page, per_page: PER_PAGE, sort };
    if (query)                p.search     = query;
    if (filterType !== 'all') p.type       = filterType;
    if (filterDiscipline)     p.discipline = filterDiscipline;
    if (filterCountry)        p.country    = filterCountry;
    if (filterCity)           p.city       = filterCity;
    if (filterSuburb)         p.suburb     = filterSuburb;
    return p;
  }, [query, filterType, filterDiscipline, filterCountry, filterCity, filterSuburb, sort]);

  const buildSwapParams = useCallback((page = 1) => {
    const p = { page, per_page: PER_PAGE, sort, openTo: 'Swaps' };
    if (query)            p.search     = query;
    if (filterDiscipline) p.discipline = filterDiscipline;
    if (filterCountry)    p.country    = filterCountry;
    if (filterCity)       p.city       = filterCity;
    if (filterSuburb)     p.suburb     = filterSuburb;
    return p;
  }, [query, filterDiscipline, filterCountry, filterCity, filterSuburb, sort]);

  // ── Refetch on view / filter change (debounced for search) ───
  useEffect(() => {
    const debounce = query ? 350 : 0;
    const handle = setTimeout(() => {
      if (viewIsSwaps) {
        dispatch(fetchInstructors(buildSwapParams(1)));
      } else {
        dispatch(fetchJobs(buildJobParams(1)));
      }
    }, debounce);
    return () => clearTimeout(handle);
  }, [dispatch, viewIsSwaps, buildJobParams, buildSwapParams, query]);

  useEffect(() => { saveSavedJobs(savedJobs); }, [savedJobs]);

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

  // ── Load more ────────────────────────────────────────────────
  const loadMore = async () => {
    setLoadingMore(true);
    if (viewIsSwaps) {
      await dispatch(fetchInstructors({
        ...buildSwapParams((instructorsMeta?.page ?? 1) + 1),
        append: true,
      }));
    } else {
      await dispatch(fetchJobs({
        ...buildJobParams((jobsMeta?.page ?? 1) + 1),
        append: true,
      }));
    }
    setLoadingMore(false);
  };

  // ── Derived view data ────────────────────────────────────────
  const currentList   = viewIsSwaps ? instructors : jobs;
  const currentStatus = viewIsSwaps ? swapsStatus : jobsStatus;
  const currentMeta   = viewIsSwaps ? instructorsMeta : jobsMeta;
  const totalShown    = currentMeta?.total ?? currentList.length;
  const hasMore       = (currentMeta?.page ?? 1) < (currentMeta?.last_page ?? 1);

  const initialLoading = currentStatus === STATUS.LOADING && currentList.length === 0;

  const hasFilters = !!(query || filterType !== 'all' || filterDiscipline
    || filterCountry || filterCity || filterSuburb || sort !== 'recent');

  const clearFilters = () => {
    setQuery(''); setFilterType('all');
    setFilterDiscipline(''); setFilterCountry('');
    setFilterCity(''); setFilterSuburb('');
    setSort('recent');
  };

  // ── UI ───────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">

      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <p className="text-[#CE4F56] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-1.5">
          Find Work
        </p>
        <h1 className="font-unbounded text-lg sm:text-xl font-black text-[#3E3D38]">
          {viewIsSwaps ? 'Instructor Swaps' : 'Job Listings'}
        </h1>
        <p className="text-[#9A9A94] text-xs sm:text-sm mt-1">
          {viewIsSwaps
            ? `${totalShown} instructor${totalShown === 1 ? '' : 's'} open to swap matching your filters`
            : `${totalShown} active opportunit${totalShown === 1 ? 'y' : 'ies'} from studios around the world`}
        </p>
      </div>

      {/* ── View toggle (segmented control) ────────────────── */}
      {iOfferSwap && (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-1 inline-flex w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setView('jobs')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
              ${view === 'jobs'
                ? 'bg-[#CE4F56] text-white shadow-sm'
                : 'text-[#6B6B66] hover:text-[#3E3D38]'}`}
          >
            <Briefcase size={14} /> Browse Jobs
          </button>
          <button
            type="button"
            onClick={() => setView('swaps')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
              ${view === 'swaps'
                ? 'bg-[#E89560] text-white shadow-sm'
                : 'text-[#6B6B66] hover:text-[#3E3D38]'}`}
          >
            <RefreshCw size={14} /> Swap with Peers
          </button>
        </div>
      )}

      {/* ── Search + filter toggle ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 min-w-0">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={viewIsSwaps ? 'Search by name or discipline…' : 'Search title, discipline…'}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4] min-w-0"
            />
            {query && (
              <IconButton variant="plain" size="xs" onClick={() => setQuery('')} aria-label="Clear">
                <X size={14} className="text-[#9A9A94]" />
              </IconButton>
            )}
          </div>

          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters((v) => !v)}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Filters</span>
            {!showFilters && hasFilters && (
              <span className="w-1.5 h-1.5 bg-[#CE4F56] rounded-full ml-1.5" />
            )}
          </Button>
        </div>

        {/* Active filter chips — visible at all times */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-[#9A9A94] font-semibold uppercase tracking-wider">
              Active:
            </span>
            {filterDiscipline && (
              <FilterChip onRemove={() => setFilterDiscipline('')}>{filterDiscipline}</FilterChip>
            )}
            {filterCountry && (
              <FilterChip onRemove={() => setFilterCountry('')}>{filterCountry}</FilterChip>
            )}
            {filterCity && (
              <FilterChip onRemove={() => setFilterCity('')}>City: {filterCity}</FilterChip>
            )}
            {filterSuburb && (
              <FilterChip onRemove={() => setFilterSuburb('')}>Suburb: {filterSuburb}</FilterChip>
            )}
            {filterType !== 'all' && !viewIsSwaps && (
              <FilterChip onRemove={() => setFilterType('all')}>
                {JOB_FILTER_TABS.find((t) => t.id === filterType)?.label || filterType}
              </FilterChip>
            )}
            {sort !== 'recent' && (
              <FilterChip onRemove={() => setSort('recent')}>
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              </FilterChip>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] text-[#CE4F56] font-bold hover:underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="border-t border-[#E5E0D8] pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              placeholder="e.g. Bali, Tokyo"
            />
            <Input
              label="Suburb"
              value={filterSuburb}
              onChange={(e) => setFilterSuburb(e.target.value)}
              placeholder="e.g. Ubud, Shibuya"
            />
          </div>
        )}
      </div>

      {/* ── Type tabs (jobs only) + Sort ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {!viewIsSwaps && (
          <div className="flex-1 min-w-0 overflow-x-auto -mx-1 px-1">
            <TabBar
              variant="pill"
              tabs={JOB_FILTER_TABS}
              activeId={filterType}
              onChange={setFilterType}
            />
          </div>
        )}
        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
          <span className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase whitespace-nowrap">
            Sort
          </span>
          <div className="flex-1 sm:flex-none sm:min-w-[160px]">
            <SelectField
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* ── Feed ───────────────────────────────────────────── */}
      {initialLoading && <CardSkeleton count={4} />}

      {!initialLoading && currentList.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={viewIsSwaps ? Users : Briefcase}
            title={viewIsSwaps ? 'No instructors match' : 'No listings found'}
            message="Try adjusting your search or filters"
            action={hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}
                className="!text-[#CE4F56] hover:!underline">
                Clear filters
              </Button>
            ) : null}
          />
        </div>
      )}

      {!initialLoading && currentList.length > 0 && (
        <div className="space-y-4">
          {currentList.map((item) => (
            <LazyVisible
              key={`${view}-${item.id}`}
              estimatedHeight={viewIsSwaps ? 220 : 340}
            >
              {viewIsSwaps ? (
                <InstructorSwapCard
                  instructor={item}
                  onMessage={() => navigate('/portal/messages')}
                />
              ) : (
                <InstructorJobCard
                  job={item}
                  user={user}
                  isSaved={savedJobs.includes(item.id)}
                  isApplying={applyingJobId === item.id}
                  onToggleSave={() => toggleSave(item.id)}
                  onApply={() => setApplyTarget(item)}
                />
              )}
            </LazyVisible>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="md"
                loading={loadingMore}
                onClick={loadMore}
                className="hover:border-[#CE4F56] hover:text-[#CE4F56]"
              >
                {viewIsSwaps ? 'Load more instructors' : 'Load more jobs'}
              </Button>
            </div>
          )}
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

// ── Inline tiny removable filter chip ──
// Kept inline (not a separate file) because it's purely a visual primitive
// for this page — uses existing Chip styling but adds a ✕ remove handler.
function FilterChip({ children, onRemove }) {
  return (
    <Chip size="xs" tone="blue" className="!pr-1.5">
      <span className="flex items-center gap-1">
        {children}
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full w-3.5 h-3.5 flex items-center justify-center"
          aria-label="Remove filter"
        >
          <X size={9} />
        </button>
      </span>
    </Chip>
  );
}