import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, Filter, X, Heart, MessageCircle, ChevronDown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInstructors, saveInstructor, unsaveInstructor, fetchSavedInstructors } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';
import { InstructorProfileModal } from '../../features/modals';
import { OPEN_TO as ALL_OPEN_TO } from '../../constants/profileConstants';

export default function SearchInstructors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instructors, savedIds, status } = useSelector((s) => s.instructor);

  const [query, setQuery]           = useState('');
  const [filters, setFilters]       = useState({ discipline: '', openTo: '', location: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId]     = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    dispatch(fetchInstructors());
    dispatch(fetchSavedInstructors());
  }, [dispatch]);

  const toggleSave = async (id, e) => {
    if (e) e.stopPropagation();
    setSavingId(id);
    if (savedIds.includes(id)) {
      await dispatch(unsaveInstructor(id));
    } else {
      await dispatch(saveInstructor(id));
    }
    setSavingId(null);
  };

  const handleMessage = (inst) => {
    setSelectedInstructor(null);
    navigate('/studio/messages');
  };

  const allDisciplines = useMemo(() => (
    [...new Set(instructors.flatMap(i => i.disciplines || []))].sort()
  ), [instructors]);

  const filtered = useMemo(() => {
    return instructors.filter(inst => {
      const q = query.toLowerCase();
      const matchQ = !q ||
        inst.name?.toLowerCase().includes(q) ||
        (inst.disciplines || []).some(d => d.toLowerCase().includes(q)) ||
        inst.location?.toLowerCase().includes(q) ||
        (inst.travelingTo || inst.traveling_to || '').toLowerCase().includes(q);
      const matchD = !filters.discipline ||
        (inst.disciplines || []).some(d => d.toLowerCase().includes(filters.discipline.toLowerCase()));
      const matchO = !filters.openTo ||
        (inst.openTo || inst.open_to || []).includes(filters.openTo);
      const matchL = !filters.location ||
        inst.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
        (inst.travelingTo || inst.traveling_to || '').toLowerCase().includes(filters.location.toLowerCase());
      return matchQ && matchD && matchO && matchL;
    });
  }, [instructors, query, filters]);

  const clearFilters = () => { setFilters({ discipline: '', openTo: '', location: '' }); setQuery(''); };
  const hasActiveFilters = query || filters.discipline || filters.openTo || filters.location;
  const loading = status === STATUS.LOADING && instructors.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Find Instructors</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Browse {instructors.length} active instructors seeking opportunities</p>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, discipline, location..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
            {query && <button onClick={() => setQuery('')} className="text-[#9A9A94] hover:text-[#CE4F56]"><X size={14} /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${showFilters ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
            <Filter size={14} /> Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#CE4F56]" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-3 gap-3 pt-1 border-t border-[#E5E0D8]">
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Discipline</label>
              <div className="relative">
                <select value={filters.discipline} onChange={e => setFilters(f => ({ ...f, discipline: e.target.value }))}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] pr-8">
                  <option value="">All disciplines</option>
                  {allDisciplines.map(d => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Open To</label>
              <div className="relative">
                <select value={filters.openTo} onChange={e => setFilters(f => ({ ...f, openTo: e.target.value }))}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] pr-8">
                  <option value="">Any arrangement</option>
                  {ALL_OPEN_TO.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Location / Traveling To</label>
              <input type="text" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Bali, Europe..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
            <p className="text-[#9A9A94] text-xs">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
            <button onClick={clearFilters} className="text-xs text-[#CE4F56] hover:underline flex items-center gap-1">
              <X size={11} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && <CardSkeleton count={6} />}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <Search size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">No instructors found</p>
          <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-[#2DA4D6] hover:underline">Clear filters</button>
        </div>
      )}

      {/* Results grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(inst => {
            const initials = inst.initials || inst.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const travelingTo = inst.travelingTo || inst.traveling_to || '';
            const countryFrom = inst.countryFrom || inst.country_from || inst.location || '';
            const openTo = inst.openTo || inst.open_to || [];
            const isSaved = savedIds.includes(inst.id);

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:border-[#2DA4D6] hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => navigate(`/studio/instructors/${inst.id}`)}
              >
                <div className="bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/20 px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white font-bold text-sm font-['Unbounded'] overflow-hidden flex-shrink-0">
                        {inst.profile_picture
                          ? <img src={inst.profile_picture} alt="" className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <div>
                        <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{inst.name}</p>
                        <p className="text-[#9A9A94] text-[10px]">{inst.pronouns}</p>
                      </div>
                    </div>
                    <button onClick={e => toggleSave(inst.id, e)} disabled={savingId === inst.id}
                      className={`p-1.5 rounded-lg transition-all ${isSaved ? 'text-[#CE4F56]' : 'text-[#C4BCB4] hover:text-[#CE4F56]'}`}>
                      {savingId === inst.id
                        ? <ButtonLoader size={16} color="#CE4F56" />
                        : <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
                    <span className="text-[#6B6B66] text-[10px] font-semibold">Actively Seeking</span>
                  </div>
                </div>

                <div className="px-5 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {(inst.disciplines || []).slice(0, 3).map(d => (
                      <span key={d} className="px-2 py-0.5 bg-[#FBF8E4] text-[#6B6B66] text-[10px] rounded-full">{d}</span>
                    ))}
                    {(inst.disciplines || []).length > 3 && (
                      <span className="px-2 py-0.5 bg-[#FBF8E4] text-[#9A9A94] text-[10px] rounded-full">+{inst.disciplines.length - 3}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                      <MapPin size={11} className="text-[#9A9A94]" />
                      <span className="text-[#9A9A94]">From</span> {countryFrom}
                      {travelingTo && <> → <span className="font-medium">{travelingTo}</span></>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                      <Calendar size={11} className="text-[#9A9A94]" />
                      <span>{inst.availability}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {openTo.map(o => (
                      <span key={o} className={`px-2 py-0.5 text-[10px] rounded-full font-medium
                        ${o === 'Direct Hire'     ? 'bg-[#2DA4D6]/10 text-[#2DA4D6]' :
                          o === 'Swaps'           ? 'bg-[#E89560]/15 text-[#E89560]' :
                          'bg-[#6BE6A4]/15 text-[#3E3D38]'}`}>
                        {o}
                      </span>
                    ))}
                  </div>

                  <p className="text-[#9A9A94] text-xs line-clamp-2">{inst.bio}</p>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedInstructor(inst)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#E5E0D8] text-[#6B6B66] rounded-xl text-xs font-bold hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-all"
                    >
                      <Eye size={12} /> Quick View
                    </button>
                    <button
                      onClick={() => navigate(`/studio/instructors/${inst.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-xs font-bold hover:bg-[#2590bd] transition-all"
                    >
                      Full Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructor Profile Modal */}
      {selectedInstructor && (
        <InstructorProfileModal
          instructor={selectedInstructor}
          isSaved={savedIds.includes(selectedInstructor.id)}
          onClose={() => setSelectedInstructor(null)}
          onMessage={() => handleMessage(selectedInstructor)}
          onToggleSave={() => toggleSave(selectedInstructor.id)}
        />
      )}
    </div>
  );
}