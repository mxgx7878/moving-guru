import { MapPin, Calendar, MessageCircle, Heart, Instagram, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Avatar } from '../../components/ui';

// Quick-look instructor preview modal. For the full experience studios are
// routed to the dedicated detail page; this modal gives a brief glance from
// search results without losing context.
export default function InstructorProfileModal({ instructor, isSaved, onClose, onMessage, onToggleSave }) {
  const navigate = useNavigate();
  if (!instructor) return null;

  const initials = instructor.initials ||
    instructor.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const instructorDetail = instructor.detail || {};

  const travelingTo = instructorDetail?.travelingTo || instructorDetail?.traveling_to || '';
  const countryFrom = instructorDetail?.countryFrom || instructorDetail?.country_from || instructorDetail?.location || '';
  const openTo = instructorDetail?.openTo || instructorDetail?.open_to || [];
  const availability = instructorDetail?.availability || '';
  const languages = instructorDetail?.languages || [];
  const instagram = instructorDetail?.instagram || instructorDetail?.social_links?.find(s => s.instagram)?.instagram || '';

  const goFullProfile = () => {
    onClose?.();
    navigate(`/studio/instructors/${instructor.id}`);
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      hideClose={false}
      title={instructor.name}
      subtitle={[instructorDetail.pronouns, instructorDetail.age ? `${instructorDetail.age} yrs` : null]
        .filter(Boolean).join(' · ')}
      footer={
        <>
          <Button
            variant={isSaved ? 'outlineDanger' : 'secondary'}
            icon={Heart}
            onClick={onToggleSave}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={goFullProfile}>
            View Full Profile
          </Button>
          <Button variant="primary" icon={MessageCircle} onClick={onMessage}>
            Send Message
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 mb-5">
        <Avatar name={instructor.name} src={instructorDetail?.profile_picture} size="xl" tone="coral" />
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#6BE6A4]/20 text-[#3E3D38]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
            Actively Seeking
          </span>
          {instagram && (
            <a
              href={instagram}
              target="_blank" rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E89560]/10"
            >
              <Instagram size={10} /> Instagram <ExternalLink size={8} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {countryFrom && (
          <InfoTile label="From / To" value={`${countryFrom}${travelingTo ? ` → ${travelingTo}` : ''}`} icon={<MapPin size={10} />} />
        )}
        {availability && (
          <InfoTile label="Availability" value={availability} icon={<Calendar size={10} />} />
        )}
        {languages.length > 0 && (
          <InfoTile label="Languages" value={languages.join(', ')} />
        )}
        {openTo.length > 0 && (
          <div className="bg-[#FBF8E4]/50 rounded-xl p-3">
            <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Open To</p>
            <div className="flex flex-wrap gap-1">
              {openTo.map(o => (
                <span key={o} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#2DA4D6]/10 text-[#2DA4D6]">{o}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(instructorDetail.disciplines || []).length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Disciplines</p>
          <div className="flex flex-wrap gap-1.5">
            {instructorDetail?.disciplines.map(d => (
              <span key={d} className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
            ))}
          </div>
        </div>
      )}

      {instructorDetail.bio && (
        <div className="mb-2">
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">About</p>
          <p className="text-[#6B6B66] text-sm leading-relaxed line-clamp-4">{instructorDetail.bio}</p>
        </div>
      )}
    </Modal>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="bg-[#FBF8E4]/50 rounded-xl p-3">
      <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
        {icon && <span className="text-[#9A9A94]">{icon}</span>} {value}
      </p>
    </div>
  );
}
