import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, MapPin, Calendar, Search, X, Eye, Globe, Users,
} from 'lucide-react';
import { fetchSavedInstructors, unsaveInstructor } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton, ButtonLoader } from '../../components/feedback';
import { Button } from '../../components/ui';

// Saved instructors grid. "View Profile" routes studios to the dedicated
// instructor detail page — modals are reserved for quick, short interactions
// and this view has enough information to be a full page.
export default function Favourites() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { instructors, savedIds, status } = useSelector((s) => s.instructor);
  const [query, setQuery] = useState('');
  const [unsavingId, setUnsavingId] = useState(null);

  useEffect(() => { dispatch(fetchSavedInstructors()); }, [dispatch]);

  const saved = instructors.filter((i) => savedIds.includes(i.id));
  const filtered = saved.filter((inst) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return inst.name?.toLowerCase().includes(q) ||
      (inst.disciplines || []).some((d) => d.toLowerCase().includes(q)) ||
      inst.location?.toLowerCase().includes(q) ||
      (inst.travelingTo || inst.traveling_to || '').toLowerCase().includes(q);
  });

  const handleUnsave = async (id, e) => {
    e?.stopPropagation?.();
    setUnsavingId(id);
    await dispatch(unsaveInstructor(id));
    setUnsavingId(null);
  };

  const loading = status === STATUS.LOADING && saved.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Saved Instructors</h1>
        <p className="text-[#9A9A94] text-sm mt-1">
          {saved.length} instructor{saved.length !== 1 ? 's' : ''} in your favourites
        </p>
      </div>

      {saved.length > 0 && (
        <div className="flex items-center gap-2 bg-white border border-[#E5E0D8] rounded-xl px-4 py-2.5">
          <Search size={16} className="text-[#9A9A94]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved instructors..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} className="text-[#9A9A94]" />
            </button>
          )}
        </div>
      )}

      {loading && <CardSkeleton count={6} />}

      {!loading && saved.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-16 text-center">
          <div className="w-14 h-14 bg-[#CE4F56]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-[#CE4F56]" />
          </div>
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-2">
            No saved instructors yet
          </p>
          <p className="text-[#9A9A94] text-sm">
            Browse instructors and tap the heart icon to save them here
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/studio/search')}
            className="mt-5"
          >
            Find Instructors
          </Button>
        </div>
      )}

      {!loading && saved.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
          <p className="text-[#9A9A94] text-sm">No results match your search</p>
          <button onClick={() => setQuery('')} className="mt-3 text-sm text-[#2DA4D6] hover:underline">
            Clear
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inst) => (
            <SavedInstructorCard
              key={inst.id}
              instructor={inst}
              unsaving={unsavingId === inst.id}
              onUnsave={(e) => handleUnsave(inst.id, e)}
              onView={() => navigate(`/studio/instructors/${inst.id}`)}
              onMessage={() => navigate('/studio/messages')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedInstructorCard({ instructor, unsaving, onUnsave, onView, onMessage }) {
  const inst = instructor;
  const initials = inst.initials || inst.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const travelingTo = inst.travelingTo || inst.traveling_to || '';
  const countryFrom = inst.countryFrom || inst.country_from || inst.location || '';
  const openTo = inst.openTo || inst.open_to || [];
  const languages = inst.languages || [];
  const disciplines = inst.disciplines || [];

  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-[#CE4F56]/20 overflow-hidden hover:border-[#CE4F56]/50 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white font-bold text-sm font-['Unbounded'] overflow-hidden flex-shrink-0">
              {inst.profile_picture
                ? <img src={inst.profile_picture} alt="" className="w-full h-full object-cover rounded-full" />
                : initials}
            </div>
            <div>
              <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{inst.name}</p>
              <p className="text-[#9A9A94] text-[10px]">
                {inst.pronouns}{inst.age ? ` · ${inst.age} yrs` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onUnsave}
            disabled={unsaving}
            className="p-1.5 rounded-lg text-[#CE4F56] hover:bg-red-50 transition-all"
            title="Remove from saved"
          >
            {unsaving ? <ButtonLoader size={16} color="#CE4F56" /> : <Heart size={16} fill="currentColor" />}
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
          <span className="text-[#6B6B66] text-[10px] font-semibold">Actively Seeking</span>
        </div>
      </div>

      <div className="px-5 pb-4 space-y-3">
        {disciplines.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {disciplines.slice(0, 4).map((d) => (
              <span key={d} className="px-2 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
            ))}
            {disciplines.length > 4 && (
              <span className="px-2 py-0.5 bg-[#FBF8E4] text-[#9A9A94] text-[10px] rounded-full">
                +{disciplines.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          {(countryFrom || travelingTo) && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <MapPin size={11} className="text-[#9A9A94] flex-shrink-0" />
              <span className="truncate">
                {countryFrom}{travelingTo && ` → ${travelingTo}`}
              </span>
            </div>
          )}
          {inst.availability && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Calendar size={11} className="text-[#9A9A94] flex-shrink-0" />
              <span className="truncate">{inst.availability}</span>
            </div>
          )}
          {languages.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Globe size={11} className="text-[#9A9A94] flex-shrink-0" />
              <span className="truncate">{languages.join(', ')}</span>
            </div>
          )}
          {inst.stats?.applications_count !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Users size={11} className="text-[#9A9A94] flex-shrink-0" />
              <span className="truncate">{inst.stats.applications_count} applications</span>
            </div>
          )}
        </div>

        {openTo.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {openTo.map((o) => (
              <span
                key={o}
                className={`px-2 py-0.5 text-[10px] rounded-full font-medium
                  ${o === 'Direct Hire' ? 'bg-[#2DA4D6]/10 text-[#2DA4D6]' :
                    o === 'Swaps' ? 'bg-[#E89560]/15 text-[#E89560]' :
                    'bg-[#6BE6A4]/15 text-[#3E3D38]'}`}
              >
                {o}
              </span>
            ))}
          </div>
        )}

        {inst.bio && <p className="text-[#9A9A94] text-xs line-clamp-2">{inst.bio}</p>}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            fullWidth
            onClick={onView}
          >
            View Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={MessageCircle}
            fullWidth
            onClick={onMessage}
          >
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
