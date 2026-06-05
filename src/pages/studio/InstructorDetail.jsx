import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  ArrowLeft, Heart, MessageCircle, MapPin, Calendar, Globe,
  Loader2, Phone, Link2, Image as ImageIcon,
} from 'lucide-react';

import {
  fetchInstructorDetail,
  saveInstructor,
  unsaveInstructor,
} from '../../store/actions/instructorAction';
import { STATUS } from '../../constants/apiConstants';
import { Section, InfoTile, Button, SocialLinksRow } from '../../components/ui';
import { ReviewList } from '../../features/reviews';
import { formatDateRange } from '../../utils/formatters';

/**
 * InstructorDetail
 * -----------------------------------------------------------------
 * Full-page view of a single instructor (studio-side). Surfaces all
 * of the fields the instructor has filled out on their own profile
 * so studios can decide whether to reach out.
 *
 * Route: /studio/instructors/:id
 */
export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedInstructor, savedIds, status } = useSelector((s) => s.instructor);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [savingToggle, setSavingToggle] = useState(false);
  const [lightbox, setLightbox] = useState(null);

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
        <Loader2 size={28} className="animate-spin text-[#4E7A1B]" />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-[#3E3D38] font-semibold">Instructor not found</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/studio/search')}
          className="!text-sky-mg hover:!underline mt-4">
          Back to search
        </Button>
      </div>
    );
  }

  const detail       = inst.detail || {};
  const disciplines  = detail.disciplines || inst.disciplines || [];
  const openTo       = detail.openTo || inst.openTo || detail.open_to || inst.open_to || [];
  const languages    = detail.languages || inst.languages || [];
  const countryFrom  = detail.countryFrom || inst.country_from;
  const travelingTo  = detail.travelingTo || inst.traveling_to;
  const location     = detail.location || inst.location;
  const availability = detail.availability
    || formatDateRange(detail.availableFrom || detail.available_from, detail.availableTo || detail.available_to);
  const bio          = detail.bio || inst.bio;
  const lookingFor   = detail.lookingFor || inst.looking_for || detail.looking_for;
  const profilePicture  = detail.profile_picture_url || detail.profile_picture || inst.profile_picture;
  const backgroundImage = detail.background_image_url || detail.background_image || inst.background_image;
  const gallery         = detail.gallery_photos_urls || detail.gallery_photos || inst.gallery_photos || [];
  const flexibleDates   = detail.flexibleDates ?? detail.flexible_dates;
  const profileStatus   = detail.profileStatus || detail.profile_status || 'active';
  const phone           = detail.phone || inst.phone;
  const website         = detail.website || inst.website;

  const heroBg = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #4E7A1B 0%, #9BE63D 60%, #F5FDA6 100%)' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}
          className="!text-ink-muted hover:!text-ink !bg-transparent !border-transparent">
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? 'outlineDanger' : 'secondary'}
            size="md"
            icon={Heart}
            loading={savingToggle}
            onClick={handleToggleSave}
            disabled={currentUser.user_id === inst.id}
            className={isSaved ? 'bg-[#4E7A1B]/5' : 'hover:border-[#4E7A1B] hover:text-[#4E7A1B]'}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button disabled={currentUser.user_id === inst.id} variant="primary" size="md" icon={MessageCircle} onClick={handleMessage}>
            Message
          </Button>
          {currentUser.user_id === inst.id && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/portal/profile')}
          >
            Edit Profile
          </Button>
)}
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="h-36 relative" style={heroBg}>
          {backgroundImage && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
          )}
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex items-end gap-4 mb-4">
            <div className="-mt-12 w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#4E7A1B] to-[#9BE63D] flex items-center justify-center flex-shrink-0">
              {profilePicture ? (
                <img src={profilePicture} alt={inst.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-unbounded text-2xl font-black text-white">
                  {(inst.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-3">
              <h1 className="font-unbounded text-xl font-black text-[#3E3D38] truncate">
                {inst.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#6B6B66] flex-wrap">
                {detail.age && <span>{detail.age} yrs</span>}
                {detail.pronouns && <span>· {detail.pronouns}</span>}
                {detail.studio && <span>· {detail.studio}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
                    ${profileStatus === 'active'
                      ? 'bg-[#B4FF5A]/20 text-[#3E3D38]'
                      : 'bg-[#FAFEE0] text-[#9A9A94]'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${profileStatus === 'active' ? 'bg-[#B4FF5A]' : 'bg-[#9A9A94]'}`} />
                  {profileStatus === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                </span>
                {inst.is_verified && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#4E7A1B]/10 text-[#4E7A1B]">
                    Verified
                  </span>
                )}
                {detail.plan && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#4E7A1B]/10 text-[#4E7A1B] capitalize">
                    {detail.plan} plan
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Social icons */}
          <SocialLinksRow social={detail.social_links} className="mb-4" />

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {location && (
              <InfoTile
                icon={<MapPin size={12} />}
                label="Current Location"
                value={location}
              />
            )}
            {(countryFrom || travelingTo) && (
              <InfoTile
                icon={<MapPin size={12} />}
                label="From / Travelling To"
                value={`${countryFrom || '—'}${travelingTo ? ` → ${travelingTo}` : ''}`}
              />
            )}
            {availability && (
              <InfoTile
                icon={<Calendar size={12} />}
                label={flexibleDates ? 'Availability (flexible)' : 'Availability'}
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
            {phone && (
              <InfoTile
                icon={<Phone size={12} />}
                label="Phone"
                value={phone}
              />
            )}
            {website && (
              <InfoTile
                icon={<Link2 size={12} />}
                label="Website"
                value={
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[#4E7A1B] hover:underline break-all"
                  >
                    {website}
                  </a>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: about + disciplines + gallery */}
        <div className="md:col-span-2 space-y-6">
          {bio && (
            <Section title="About">
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{bio}</p>
            </Section>
          )}

          {lookingFor && (
            <Section title="What I'm Looking For">
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{lookingFor}</p>
            </Section>
          )}

          {disciplines.length > 0 && (
            <Section title="Disciplines">
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 bg-[#4E7A1B]/10 text-[#4E7A1B] text-xs font-medium rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {gallery.length > 0 && (
            <Section title="Gallery">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setLightbox(url)}
                    className="aspect-square rounded-xl overflow-hidden bg-[#FAFEE0] border border-[#E5E0D8] hover:border-[#4E7A1B] transition-colors"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Section>
          )}

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
                    className="px-2.5 py-1 bg-[#FAFEE0] text-[#3E3D38] text-xs font-medium rounded-full"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {(detail.availableFrom || detail.available_from || detail.availableTo || detail.available_to) && (
            <Section title="Available Dates">
              <div className="space-y-2 text-xs text-[#6B6B66]">
                {(detail.availableFrom || detail.available_from) && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9A9A94] font-bold">From</p>
                    <p className="text-[#3E3D38] font-medium">{detail.availableFrom || detail.available_from}</p>
                  </div>
                )}
                {(detail.availableTo || detail.available_to) && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#9A9A94] font-bold">To</p>
                    <p className="text-[#3E3D38] font-medium">{detail.availableTo || detail.available_to}</p>
                  </div>
                )}
                {flexibleDates && (
                  <p className="text-[10px] text-[#4E7A1B] font-semibold mt-1">✓ Flexible with dates</p>
                )}
              </div>
            </Section>
          )}

          {languages.length > 0 && (
            <Section title="Languages">
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l) => (
                  <span key={l} className="px-2.5 py-1 bg-[#F5FDA6]/30 text-[#3E3D38] text-xs font-medium rounded-full">
                    {l}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-[#3E3D38]/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
