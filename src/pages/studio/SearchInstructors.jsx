import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Filter, X, Heart, MessageCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DUMMY_INSTRUCTORS = [
  { id: 1, name: 'Bambi Romanowski', age: 30, pronouns: 'She/Her', disciplines: ['Reformer Pilates', 'Mat Pilates', 'Barre'], location: 'Sydney, Australia', countryFrom: 'Australia', travelingTo: 'South America, Italy', availability: 'Aug–Oct 2026', openTo: ['Swaps', 'Direct Hire'], languages: ['English', 'Spanish (learning)'], bio: 'Passionate reformer instructor looking to teach and connect across the globe.', initials: 'BR', status: 'active' },
  { id: 2, name: 'Sarah Chen', age: 28, pronouns: 'She/Her', disciplines: ['Vinyasa Yoga', 'Yin Yoga', 'Meditation'], location: 'Singapore', countryFrom: 'Singapore', travelingTo: 'Europe', availability: 'Sep–Dec 2026', openTo: ['Direct Hire'], languages: ['English', 'Mandarin'], bio: 'Yoga teacher with 5 years experience looking for studio opportunities in Europe.', initials: 'SC', status: 'active' },
  { id: 3, name: 'Marco Silva', age: 34, pronouns: 'He/Him', disciplines: ['Muay Thai', 'Boxing', 'Kickboxing'], location: 'São Paulo, Brazil', countryFrom: 'Brazil', travelingTo: 'Southeast Asia', availability: 'Oct 2026', openTo: ['Swaps', 'Direct Hire', 'Energy Exchange'], languages: ['Portuguese', 'English', 'Spanish'], bio: 'Certified Muay Thai instructor with competition experience wanting to share the art globally.', initials: 'MS', status: 'active' },
  { id: 4, name: 'Yuki Tanaka', age: 26, pronouns: 'She/Her', disciplines: ['Ballet Fitness', 'Contemporary Dance', 'Barre'], location: 'Tokyo, Japan', countryFrom: 'Japan', travelingTo: 'Europe, Australia', availability: 'Jul–Nov 2026', openTo: ['Direct Hire'], languages: ['Japanese', 'English'], bio: 'Former ballet dancer turned instructor bringing precision and artistry to every class.', initials: 'YT', status: 'active' },
  { id: 5, name: 'Priya Nair', age: 31, pronouns: 'She/Her', disciplines: ['Hatha Yoga', 'Prenatal Yoga', 'Meditation'], location: 'Mumbai, India', countryFrom: 'India', travelingTo: 'USA, Canada', availability: 'Sep–Nov 2026', openTo: ['Direct Hire', 'Energy Exchange'], languages: ['English', 'Hindi'], bio: 'Specialising in prenatal and restorative yoga with a gentle, holistic approach.', initials: 'PN', status: 'active' },
  { id: 6, name: 'Tom Walsh', age: 38, pronouns: 'He/Him', disciplines: ['Spinning / Indoor Cycling', 'HIIT', 'Bootcamp'], location: 'Dublin, Ireland', countryFrom: 'Ireland', travelingTo: 'USA, Australia', availability: 'Aug–Dec 2026', openTo: ['Swaps', 'Direct Hire'], languages: ['English'], bio: 'High energy fitness coach with 10 years experience leading group fitness worldwide.', initials: 'TW', status: 'active' },
];

const ALL_DISCIPLINES = [...new Set(DUMMY_INSTRUCTORS.flatMap(i => i.disciplines))].sort();
const ALL_OPEN_TO = ['Direct Hire', 'Swaps', 'Energy Exchange'];

export default function SearchInstructors() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ discipline: '', openTo: '', location: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [saved, setSaved] = useState([]);

  const toggleSave = (id) => {
    setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const filtered = useMemo(() => {
    return DUMMY_INSTRUCTORS.filter(inst => {
      const q = query.toLowerCase();
      const matchesQuery = !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.disciplines.some(d => d.toLowerCase().includes(q)) ||
        inst.location.toLowerCase().includes(q) ||
        inst.travelingTo.toLowerCase().includes(q);

      const matchesDiscipline = !filters.discipline ||
        inst.disciplines.some(d => d.toLowerCase().includes(filters.discipline.toLowerCase()));

      const matchesOpenTo = !filters.openTo ||
        inst.openTo.includes(filters.openTo);

      const matchesLocation = !filters.location ||
        inst.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        inst.travelingTo.toLowerCase().includes(filters.location.toLowerCase());

      return matchesQuery && matchesDiscipline && matchesOpenTo && matchesLocation;
    });
  }, [query, filters]);

  const clearFilters = () => {
    setFilters({ discipline: '', openTo: '', location: '' });
    setQuery('');
  };

  const hasActiveFilters = query || filters.discipline || filters.openTo || filters.location;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Find Instructors</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Browse {DUMMY_INSTRUCTORS.length} active instructors seeking opportunities</p>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, discipline, location..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#9A9A94] hover:text-[#CE4F56]">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${showFilters ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}
          >
            <Filter size={14} /> Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#CE4F56]" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-3 gap-3 pt-1 border-t border-[#E5E0D8]">
            {/* Discipline filter */}
            <div className="relative">
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Discipline</label>
              <div className="relative">
                <select
                  value={filters.discipline}
                  onChange={e => setFilters(f => ({ ...f, discipline: e.target.value }))}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] transition-all pr-8"
                >
                  <option value="">All disciplines</option>
                  {ALL_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>

            {/* Open to filter */}
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Open To</label>
              <div className="relative">
                <select
                  value={filters.openTo}
                  onChange={e => setFilters(f => ({ ...f, openTo: e.target.value }))}
                  className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] transition-all pr-8"
                >
                  <option value="">Any arrangement</option>
                  {ALL_OPEN_TO.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
              </div>
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Location / Traveling To</label>
              <input
                type="text"
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Bali, Europe..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
              />
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

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <Search size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">No instructors found</p>
          <p className="text-[#9A9A94] text-sm mt-1">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-[#2DA4D6] hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(inst => (
            <div key={inst.id} className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:border-[#2DA4D6] hover:shadow-sm transition-all group">
              {/* Card header */}
              <div className="bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/20 px-5 pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white font-bold text-sm font-['Unbounded']">
                      {inst.initials}
                    </div>
                    <div>
                      <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{inst.name}</p>
                      <p className="text-[#9A9A94] text-[10px]">{inst.pronouns}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSave(inst.id)}
                    className={`p-1.5 rounded-lg transition-all ${saved.includes(inst.id) ? 'text-[#CE4F56]' : 'text-[#C4BCB4] hover:text-[#CE4F56]'}`}
                  >
                    <Heart size={16} fill={saved.includes(inst.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Active badge */}
                <div className="flex items-center gap-1 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
                  <span className="text-[#6B6B66] text-[10px] font-semibold">Actively Seeking</span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 pb-4 space-y-3">
                {/* Disciplines */}
                <div className="flex flex-wrap gap-1">
                  {inst.disciplines.slice(0, 3).map(d => (
                    <span key={d} className="px-2 py-0.5 bg-[#EDE8DF] text-[#6B6B66] text-[10px] rounded-full">{d}</span>
                  ))}
                  {inst.disciplines.length > 3 && (
                    <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#9A9A94] text-[10px] rounded-full">+{inst.disciplines.length - 3}</span>
                  )}
                </div>

                {/* Travel info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <MapPin size={11} className="text-[#9A9A94]" />
                    <span className="text-[#9A9A94]">From</span> {inst.countryFrom} → <span className="font-medium">{inst.travelingTo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <Calendar size={11} className="text-[#9A9A94]" />
                    <span>{inst.availability}</span>
                  </div>
                </div>

                {/* Open to tags */}
                <div className="flex flex-wrap gap-1">
                  {inst.openTo.map(o => (
                    <span key={o} className={`px-2 py-0.5 text-[10px] rounded-full font-medium
                      ${o === 'Direct Hire' ? 'bg-[#2DA4D6]/10 text-[#2DA4D6]' :
                        o === 'Swaps' ? 'bg-[#E89560]/15 text-[#E89560]' :
                        'bg-[#6BE6A4]/15 text-[#3E3D38]'}`}>
                      {o}
                    </span>
                  ))}
                </div>

                {/* Bio snippet */}
                <p className="text-[#9A9A94] text-xs line-clamp-2">{inst.bio}</p>

                {/* Action */}
                <button
                  onClick={() => navigate('/studio/messages')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-xs font-bold hover:bg-[#2590bd] transition-all"
                >
                  <MessageCircle size={13} /> Message Instructor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}