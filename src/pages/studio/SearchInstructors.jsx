import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Calendar, Filter, X, Heart, MessageCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInstructors, saveInstructor, unsaveInstructor, fetchSavedInstructors } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';
import { Avatar, Button, Input, SelectField, IconButton } from '../../components/ui';
import { InstructorProfileModal } from '../../features/modals';
import { OPEN_TO as ALL_OPEN_TO } from '../../constants/profileConstants';
import StartChatModal from '../../features/chat/StartChatModal';
import { ALL_DISCIPLINES } from '../../data/disciplines';

export default function SearchInstructors() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instructors, savedIds, status } = useSelector((s) => s.instructor);

  const [query, setQuery]           = useState('');
  const [filters, setFilters]       = useState({ discipline: '', openTo: '', location: '' });
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState({ discipline: '', openTo: '', location: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId]     = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const debounceTimer = useRef(null);

  // Debounce search and filters
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [query, filters]);

  // Fetch instructors with debounced params
  useEffect(() => {
    const params = {};
    if (debouncedQuery) params.search = debouncedQuery;
    if (debouncedFilters.discipline) params.discipline = debouncedFilters.discipline;
    if (debouncedFilters.openTo) params.open_to = debouncedFilters.openTo;
    if (debouncedFilters.location) params.location = debouncedFilters.location;
    
    dispatch(fetchInstructors(params));
    // dispatch(fetchSavedInstructors());
  }, [dispatch, debouncedQuery, debouncedFilters]);

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
    setChatTarget({ id: inst.id, name: inst.name });
  };
  const allDisciplines = useMemo(() => (
    [...new Set(instructors.flatMap(i => i.disciplines || []))].sort()
  ), [instructors]);

  // Use server-filtered results directly (no client-side filtering needed)
  const filtered = instructors;

  const clearFilters = () => { setFilters({ discipline: '', openTo: '', location: '' }); setQuery(''); };
  const hasActiveFilters = query || filters.discipline || filters.openTo || filters.location;
  const isSearching = query !== debouncedQuery || JSON.stringify(filters) !== JSON.stringify(debouncedFilters);
  const loading = (status === STATUS.LOADING || isSearching) && instructors.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Find Instructors</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Browse {instructors.length} active instructors seeking opportunities</p>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, discipline, location..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
            {query && (
              <IconButton variant="plain" size="xs" onClick={() => setQuery('')} aria-label="Clear search" className="!text-ink-soft hover:!text-coral">
                <X size={14} />
              </IconButton>
            )}
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? '' : 'hover:border-sky-mg'}
          >
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-coral ml-1" />}
          </Button>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-3 gap-3 pt-1 border-t border-[#E5E0D8]">
            <SelectField
              label="Discipline"
              value={filters.discipline}
              onChange={(v) => setFilters((f) => ({ ...f, discipline: v }))}
              options={ALL_DISCIPLINES}
              placeholder="All disciplines"
              accent="#4E7A1B"
              size="sm"
            />
            <SelectField
              label="Open To"
              value={filters.openTo}
              onChange={(v) => setFilters((f) => ({ ...f, openTo: v }))}
              options={ALL_OPEN_TO}
              placeholder="Any arrangement"
              accent="#4E7A1B"
              size="sm"
            />
            <Input
              label="Location / Traveling To"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Bali, Europe..."
              accent="#4E7A1B"
            />
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
            <div className="flex items-center gap-2">
              <p className="text-[#9A9A94] text-xs">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
              {isSearching && <ButtonLoader size={12} color="#4E7A1B" />}
            </div>
            <Button
              variant="ghost"
              size="xs"
              icon={X}
              onClick={clearFilters}
              className="!text-coral hover:!underline"
            >
              Clear all
            </Button>
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
          <Button variant="ghost" size="sm" onClick={clearFilters} className="!text-sky-mg hover:!underline mt-4">
            Clear filters
          </Button>
        </div>
      )}

      {/* Results grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(inst => {
            const initials = inst.initials || inst.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const travelingTo = inst.detail.travelingTo || inst.detail.traveling_to || '';
            const countryFrom = inst.detail.countryFrom || inst.detail.country_from || inst.detail.location || '';
            const openTo = inst.detail.openTo || inst.detail.open_to || [];
            const isSaved = savedIds.includes(inst.id);

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:border-coral hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => navigate(`/studio/instructors/${inst.id}`)}
              >
                <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F5FDA6]/20 px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={inst.name}
                        src={inst?.detail?.profile_picture_url || inst?.detail?.profile_picture}
                        size="md"
                        tone="coral"
                      />
                      <div>
                        <p className="font-unbounded text-sm font-black text-[#3E3D38]">{inst.name}</p>
                        <p className="text-[#9A9A94] text-[10px]">{inst.detail.pronouns}</p>
                      </div>
                    </div>
                    <IconButton
                      variant="plain"
                      tone="coral"
                      disabled={savingId === inst.id}
                      onClick={(e) => toggleSave(inst.id, e)}
                      title={isSaved ? 'Remove from saved' : 'Save instructor'}
                      className={isSaved ? '' : '!text-ink-faint hover:!text-coral'}
                    >
                      {savingId === inst.id
                        ? <ButtonLoader size={16} color="#4E7A1B" />
                        : <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />}
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B4FF5A]" />
                    <span className="text-[#6B6B66] text-[10px] font-semibold">Actively Seeking</span>
                  </div>
                </div>

                <div className="px-5 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {(inst.detail.disciplines || []).slice(0, 3).map(d => (
                      <span key={d} className="px-2 py-0.5 bg-[#FAFEE0] text-[#6B6B66] text-[10px] rounded-full">{d}</span>
                    ))}
                    {(inst.detail.disciplines || []).length > 3 && (
                      <span className="px-2 py-0.5 bg-[#FAFEE0] text-[#9A9A94] text-[10px] rounded-full">+{inst.detail.disciplines.length - 3}</span>
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
                      <span>{inst?.detail.availability}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {openTo.map(o => (
                      <span key={o} className={`px-2 py-0.5 text-[10px] rounded-full font-medium
                        ${o === 'Direct Hire'     ? 'bg-coral/10 text-coral' :
                          o === 'Swaps'           ? 'bg-[#9BE63D]/15 text-[#9BE63D]' :
                          'bg-[#B4FF5A]/15 text-[#3E3D38]'}`}>
                        {o}
                      </span>
                    ))}
                  </div>

                  <p className="text-[#9A9A94] text-xs line-clamp-2">{inst?.detail.bio}</p>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      fullWidth
                      onClick={() => setSelectedInstructor(inst)}
                      className="hover:border-coral hover:text-coral"
                    >
                      Quick View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => navigate(`/studio/instructors/${inst.id}`)}
                    >
                      Full Profile
                    </Button>
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

       {chatTarget && (
        <StartChatModal
          recipientId={chatTarget.id}
          recipientName={chatTarget.name}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}