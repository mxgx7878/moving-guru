import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, MessageCircle, MapPin, Globe, Phone, Instagram, Loader2,
  Building2, Briefcase, Calendar, GraduationCap, Clock, ExternalLink,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { Section, Button } from '../../components/ui';
import { ReviewList } from '../../features/reviews';

/**
 * StudioDetail
 * -----------------------------------------------------------------
 * Full-page public view of a studio. Instructors reach here from the
 * Find Work feed (or anywhere a studio is linked) to see the studio's
 * bio, hiring state, gallery and reviews before applying or messaging.
 *
 * Route: /portal/studios/:id and /studio/studios/:id — both role portals
 * can share the same read-only page since the data is identical.
 */
export default function StudioDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const messagesBase = user?.role === 'studio' ? '/studio/messages' : '/portal/messages';

  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axiosInstance.get(`${API_ENDPOINTS.STUDIO_DETAIL}/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const payload = data?.data?.studio || data?.data || null;
        setStudio(payload);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Studio not found.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#2DA4D6]" />
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-[#3E3D38] font-semibold">{error || 'Studio not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-[#2DA4D6] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const detail = studio.detail || {};
  const studioName = studio.studio_name || studio.name || detail.studioName || 'Studio';
  const initials = studioName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const location = [studio.location || detail.location, studio.country || detail.country].filter(Boolean).join(', ');
  const disciplines = studio.disciplines || detail.disciplines || [];
  const openTo = studio.open_to || detail.open_to || studio.openTo || detail.openTo || [];
  const profileStatus = studio.profile_status || detail.profile_status || 'active';
  const isHiring = profileStatus === 'active';
  const amenities = studio.amenities || detail.amenities || [];
  const gallery = studio.gallery_photos || detail.gallery_photos || [];

  const hiringRoleDesc = studio.hiring_role_description || detail.hiring_role_description;
  const hiringStart    = studio.hiring_start_date        || detail.hiring_start_date;
  const hiringComp     = studio.hiring_compensation      || detail.hiring_compensation;
  const hiringDuration = studio.hiring_duration          || detail.hiring_duration;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B6B66] hover:text-[#3E3D38] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <Button variant="primary" icon={MessageCircle} onClick={() => navigate(messagesBase)}>
          Message Studio
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div
          className="h-32"
          style={{ background: 'linear-gradient(135deg, #2DA4D6 0%, #6BE6A4 60%, #f5fca6 100%)' }}
        />
        <div className="px-6 pb-6 relative">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center flex-shrink-0">
              {studio.profile_picture || detail.profile_picture
                ? <img src={studio.profile_picture || detail.profile_picture} alt={studioName} className="w-full h-full object-cover" />
                : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] truncate">
                {studioName}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#9A9A94] flex-wrap">
                {studio.contact_name && <span>Managed by {studio.contact_name}</span>}
                {(studio.studio_size || detail.studio_size) && (
                  <span>· {studio.studio_size || detail.studio_size}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
                  ${isHiring ? 'bg-[#6BE6A4]/20 text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#6B6B66]'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isHiring ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                  {isHiring ? 'Actively Hiring' : 'Not Hiring'}
                </span>
                {studio.instagram && (
                  <a
                    href={studio.instagram.startsWith('http') ? studio.instagram : `https://instagram.com/${studio.instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20"
                  >
                    <Instagram size={10} /> Instagram
                  </a>
                )}
                {studio.website && (
                  <a
                    href={studio.website.startsWith('http') ? studio.website : `https://${studio.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#2DA4D6]/10 text-[#2DA4D6] hover:bg-[#2DA4D6]/20"
                  >
                    <Globe size={10} /> Website <ExternalLink size={8} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {location && (
              <InfoTile icon={<MapPin size={12} />} label="Location" value={location} />
            )}
            {studio.phone && (
              <InfoTile icon={<Phone size={12} />} label="Phone" value={studio.phone} />
            )}
            {(studio.studio_size || detail.studio_size) && (
              <InfoTile icon={<Building2 size={12} />} label="Studio Size" value={studio.studio_size || detail.studio_size} />
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {studio.bio && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">About the Studio</h3>
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{studio.bio}</p>
            </Section>
          )}

          {isHiring && hiringRoleDesc && (
            <Section>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-[#3E3D38]" />
                <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Currently Hiring</h3>
              </div>
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{hiringRoleDesc}</p>
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#E5E0D8]">
                {hiringStart && (
                  <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                    <Calendar size={11} /> Starts {hiringStart}
                  </span>
                )}
                {hiringDuration && (
                  <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                    <Clock size={11} /> {hiringDuration}
                  </span>
                )}
                {hiringComp && (
                  <span className="text-xs text-[#3E3D38] font-semibold">{hiringComp}</span>
                )}
              </div>
            </Section>
          )}

          {disciplines.length > 0 && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Disciplines Offered</h3>
              <div className="flex flex-wrap gap-1.5">
                {disciplines.map(d => (
                  <span key={d} className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-xs font-medium rounded-full">{d}</span>
                ))}
              </div>
            </Section>
          )}

          {gallery.length > 0 && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {gallery.map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#FBF8E4]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section>
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Reviews from Instructors</h3>
            <ReviewList
              userId={studio.id}
              direction="instructor_to_studio"
              emptyLabel="No reviews yet — no instructor has reviewed this studio on Moving Guru."
            />
          </Section>
        </div>

        <div className="space-y-6">
          {openTo.length > 0 && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Open To</h3>
              <div className="flex flex-wrap gap-1.5">
                {openTo.map(o => (
                  <span key={o} className="px-2.5 py-1 bg-[#FBF8E4] text-[#3E3D38] text-xs font-medium rounded-full">{o}</span>
                ))}
              </div>
            </Section>
          )}

          {amenities.length > 0 && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(a => (
                  <span key={a} className="px-2.5 py-1 bg-[#FBF8E4] text-[#6B6B66] text-xs font-medium rounded-full">{a}</span>
                ))}
              </div>
            </Section>
          )}

          {studio.hiring_qualification_level && studio.hiring_qualification_level !== 'none' && (
            <Section>
              <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Minimum Qualification</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                <GraduationCap size={11} /> {studio.hiring_qualification_level}
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
