import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  ArrowLeft, Heart, MessageCircle, MapPin, Calendar, Globe,
  GraduationCap, Instagram, Loader2, Star,
} from 'lucide-react';

import {
  fetchInstructorDetail,
  saveInstructor,
  unsaveInstructor,
} from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import  ReviewList  from '../../components/ReviewList';
import { ButtonLoader } from '../../components/feedback';

/**
 * InstructorDetail
 * -----------------------------------------------------------------
 * Full-page view of a single instructor (studio-side). Replaces
 * the older modal-only UX for cases where the studio wants to dig
 * deep (full bio, gallery, reviews) rather than glance.
 *
 * Route: /studio/instructors/:id
 *
 * Data sources:
 *   - Redux: instructor.selectedInstructor populated by fetchInstructorDetail
 *   - ReviewList fetches its own data keyed by userId, so we don't
 *     duplicate that here.
 *
 * Side effects: calling fetchInstructorDetail also records a profile
 * view on the backend — same as opening the modal used to do.
 */
export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedInstructor, savedIds, status } = useSelector((s) => s.instructor);

  const [savingToggle, setSavingToggle] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchInstructorDetail(id));
  }, [id, dispatch]);

  const loading = status === STATUS.LOADING && !selectedInstructor;
  const inst = selectedInstructor;
  const isSaved = inst ? savedIds.includes(inst.id) : false;

  const handleToggleSave = async () => {
    if (!inst) return;
    setSavingToggle(true);
    if (isSaved) {
      await dispatch(unsaveInstructor(inst.id));
      toast.success('Removed from saved instructors');
    } else {
      await dispatch(saveInstructor(inst.id));
      toast.success('Saved to your favourites');
    }
    setSavingToggle(false);
  };

  const handleMessage = () => {
    navigate('/studio/messages');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#2DA4D6]" />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-[#3E3D38] font-semibold">Instructor not found</p>
        <button
          onClick={() => navigate('/studio/search')}
          className="mt-4 text-sm text-[#2DA4D6] hover:underline"
        >
          Back to search
        </button>
      </div>
    );
  }

  const detail = inst.detail || {};
  const initials = (inst.name || '?')
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const disciplines = detail.disciplines || inst.disciplines || [];
  const openTo = detail.openTo || inst.openTo || detail.open_to || inst.open_to || [];
  const languages = detail.languages || inst.languages || [];
  const countryFrom = detail.countryFrom || inst.country_from || inst.location || detail.location;
  const travelingTo = detail.travelingTo || inst.traveling_to;
  const availability = detail.availability || inst.availability;
  const bio = detail.bio || inst.bio;
  const lookingFor = detail.lookingFor || inst.looking_for || detail.looking_for;
  const profilePicture = detail.profile_picture || inst.profile_picture;
  const instagram = detail.social_links?.instagram || inst.instagram;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B6B66] hover:text-[#3E3D38] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            disabled={savingToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-60
              ${isSaved
                ? 'bg-[#CE4F56]/5 border-[#CE4F56] text-[#CE4F56]'
                : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#CE4F56]'}`}
          >
            {savingToggle
              ? <ButtonLoader size={14} color="#CE4F56" />
              : <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all"
          >
            <MessageCircle size={14} /> Message
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div
          className="h-32"
          style={{
            background: 'linear-gradient(135deg, #CE4F56 0%, #E89560 60%, #f5fca6 100%)',
          }}
        />
        <div className="px-6 pb-6 relative">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center flex-shrink-0">
              {profilePicture
                ? <img src={profilePicture} alt={inst.name} className="w-full h-full object-cover" />
                : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] truncate">
                {inst.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#9A9A94] flex-wrap">
                {detail.age && <span>{detail.age} yrs</span>}
                {detail.pronouns && <span>· {detail.pronouns}</span>}
                {detail.studio && <span>· {detail.studio}</span>}
              </div>
              {/* Status + social */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#6BE6A4]/20 text-[#3E3D38]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
                  Actively Seeking
                </span>
                {instagram && (
                  <a
                    href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E89560]/10 transition-colors"
                  >
                    <Instagram size={10} /> Instagram
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid md:grid-cols-3 gap-3">
            {countryFrom && (
              <InfoTile
                icon={<MapPin size={12} />}
                label="From / To"
                value={`${countryFrom}${travelingTo ? ` → ${travelingTo}` : ''}`}
              />
            )}
            {availability && (
              <InfoTile
                icon={<Calendar size={12} />}
                label="Availability"
                value={availability}
              />
            )}
            {languages.length > 0 && (
              <InfoTile
                icon={<Globe size={12} />}
                label="Languages"
                value={languages.join(', ')}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: about + disciplines */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          {bio && (
            <Section title="About">
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{bio}</p>
            </Section>
          )}

          {/* What I'm looking for */}
          {lookingFor && (
            <Section title="What I'm Looking For">
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{lookingFor}</p>
            </Section>
          )}

          {/* Disciplines */}
          {disciplines.length > 0 && (
            <Section title="Disciplines">
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-xs font-medium rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Reviews */}
          <Section title="Reviews">
            <ReviewList
              userId={inst.id}
              direction="studio_to_instructor"
              emptyLabel="No reviews yet — this instructor hasn't been reviewed by studios on Moving Guru."
            />
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {openTo.length > 0 && (
            <Section title="Open To">
              <div className="flex flex-wrap gap-1.5">
                {openTo.map((o) => (
                  <span
                    key={o}
                    className="px-2.5 py-1 bg-[#FBF8E4] text-[#3E3D38] text-xs font-medium rounded-full"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {detail.plan && (
            <Section title="Plan">
              <span className="inline-block px-3 py-1 bg-[#6BE6A4]/20 text-[#3E3D38] text-xs font-semibold rounded-full capitalize">
                {detail.plan}
              </span>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-[#FBF8E4]/50 rounded-xl p-3">
      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1.5">
        <span className="text-[#9A9A94]">{icon}</span> {value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">{title}</h3>
      {children}
    </div>
  );
}