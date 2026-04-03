import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Clock, Briefcase, RefreshCw, Zap,
  X, Filter, ChevronDown, MessageCircle, Bookmark, BookmarkCheck, Users
} from 'lucide-react';
import { fetchJobs } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';

const JOB_TYPES = [
  { id: 'all',             label: 'All Listings',    color: '#3E3D38', bg: 'bg-[#3E3D38]' },
  { id: 'hire',            label: 'Direct Hire',     color: '#2DA4D6', bg: 'bg-[#2DA4D6]' },
  { id: 'swap',            label: 'Instructor Swap', color: '#E89560', bg: 'bg-[#E89560]' },
  { id: 'energy_exchange', label: 'Energy Exchange', color: '#6BE6A4', bg: 'bg-[#6BE6A4]' },
];

const TYPE_STYLES = {
  hire:            { icon: Briefcase, color: '#2DA4D6', bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]',  label: 'Direct Hire' },
  swap:            { icon: RefreshCw, color: '#E89560', bg: 'bg-[#E89560]/15', text: 'text-[#E89560]',  label: 'Instructor Swap' },
  energy_exchange: { icon: Zap,       color: '#6BE6A4', bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]',  label: 'Energy Exchange' },
};

export default function FindWork() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { jobs, status } = useSelector((s) => s.job);

  const [query,       setQuery]       = useState('');
  const [filterType,  setFilterType]  = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterLocation,   setFilterLocation]   = useState('');
  const [savedJobs,   setSavedJobs]   = useState([]);
  const [applyingId,  setApplyingId]  = useState(null);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  // Only show active listings
  const activeJobs = useMemo(() => jobs.filter(j => j.is_active !== false), [jobs]);

  const allDisciplines = useMemo(() => (
    [...new Set(activeJobs.flatMap(j => j.disciplines || []))].sort()
  ), [activeJobs]);

  const filtered = useMemo(() => {
    return activeJobs.filter(job => {
      const q = query.toLowerCase();
      const matchQ = !q ||
        job.title?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        (job.disciplines || []).some(d => d.toLowerCase().includes(q));
      const matchType = filterType === 'all' || job.type === filterType;
      const matchD = !filterDiscipline ||
        (job.disciplines || []).some(d => d.toLowerCase().includes(filterDiscipline.toLowerCase()));
      const matchL = !filterLocation ||
        job.location?.toLowerCase().includes(filterLocation.toLowerCase());
      return matchQ && matchType && matchD && matchL;
    });
  }, [activeJobs, query, filterType, filterDiscipline, filterLocation]);

  const clearFilters = () => {
    setQuery(''); setFilterType('all');
    setFilterDiscipline(''); setFilterLocation('');
  };
  const hasFilters = query || filterType !== 'all' || filterDiscipline || filterLocation;

  const toggleSaveJob = (id) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleApply = async (job) => {
    setApplyingId(job.id);
    await new Promise(r => setTimeout(r, 600));
    setApplyingId(null);
    navigate('/portal/messages');
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
          { label: 'Direct Hire',     count: activeJobs.filter(j => j.type === 'hire').length,            color: 'text-[#2DA4D6]' },
          { label: 'Swaps',           count: activeJobs.filter(j => j.type === 'swap').length,            color: 'text-[#E89560]' },
          { label: 'Energy Exchange', count: activeJobs.filter(j => j.type === 'energy_exchange').length, color: 'text-[#6B6B66]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
            <p className={`font-['Unbounded'] text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-[#9A9A94] text-xs font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        {/* Search input */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
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

        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilterType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${filterType === t.id ? 'text-white shadow-sm' : 'bg-[#F4F0EA] text-[#6B6B66] hover:bg-[#EDE8DF]'}`}
              style={filterType === t.id ? { backgroundColor: t.color } : {}}>
              {t.label}
              {t.id !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({activeJobs.filter(j => t.id === 'all' || j.type === t.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E0D8]">
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Discipline</label>
              <div className="relative">
                <select value={filterDiscipline} onChange={e => setFilterDiscipline(e.target.value)}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#CE4F56] pr-8">
                  <option value="">All disciplines</option>
                  {allDisciplines.map(d => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Location</label>
              <input value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
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

      {/* Loading */}
      {loading && <CardSkeleton count={4} />}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <Briefcase size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">No listings found</p>
          <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-[#CE4F56] hover:underline">Clear filters</button>
        </div>
      )}

      {/* Job listings */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(job => {
            const typeInfo = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
            const TypeIcon = typeInfo.icon;
            const isSaved  = savedJobs.includes(job.id);

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
                        <div>
                          <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-[#9A9A94] text-xs mt-0.5">Posted by a studio on Moving Guru</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Type badge */}
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white`}
                            style={{ backgroundColor: typeInfo.color }}>
                            {typeInfo.label}
                          </span>
                          {/* Save button */}
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
                    <div className="bg-[#F4F0EA] rounded-xl px-4 py-2.5 mb-4">
                      <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Requirements</p>
                      <p className="text-[#6B6B66] text-xs leading-relaxed">{job.requirements}</p>
                    </div>
                  )}

                  {/* Disciplines */}
                  {(job.disciplines || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.disciplines.map(d => (
                        <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA row */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#E5E0D8]">
                    {/* Match indicator */}
                    {(user?.disciplines || []).some(d => (job.disciplines || []).includes(d)) && (
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
                    <button onClick={() => handleApply(job)} disabled={applyingId === job.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#CE4F56] text-white rounded-xl text-xs font-bold hover:bg-[#b8454c] transition-all disabled:opacity-60">
                      {applyingId === job.id
                        ? <><ButtonLoader size={13} /> Sending...</>
                        : <><MessageCircle size={13} /> Express Interest</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}