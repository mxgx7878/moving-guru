import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchSavedInstructors, unsaveInstructor } from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton } from '../../components/feedback';
import { Button, SearchBar } from '../../components/ui';
import { SavedInstructorCard } from '../../features/instructors';

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

  console.log(instructors )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Saved Instructors</h1>
        <p className="text-[#9A9A94] text-sm mt-1">
          {saved.length} instructor{saved.length !== 1 ? 's' : ''} in your favourites
        </p>
      </div>

      {saved.length > 0 && (
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search saved instructors..."
          className="bg-white"
        />
      )}

      {loading && <CardSkeleton count={6} />}

      {!loading && saved.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-16 text-center">
          <div className="w-14 h-14 bg-[#CE4F56]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-[#CE4F56]" />
          </div>
          <p className="font-unbounded text-sm font-black text-[#3E3D38] mb-2">
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
          <Button variant="ghost" size="sm" onClick={() => setQuery('')} className="!text-sky-mg hover:!underline mt-3">
            Clear
          </Button>
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
