import {
  MapPin, Calendar, Globe, Users, Heart, Eye, MessageCircle,
} from 'lucide-react';
import { Avatar, Button, Chip } from '../../components/ui';
import { ButtonLoader } from '../../components/feedback';
import { getInitials } from '../../utils/getInitials';

// Studio-facing card used on the Favourites list. Shows enough of an
// instructor's profile to decide whether to message them. All action
// callbacks are optional — parent owns save/unsave/message routing.
const OPEN_TO_TONES = {
  'Direct Hire':     'bg-[#2DA4D6]/10 text-[#2DA4D6]',
  'Swaps':           'bg-[#E89560]/15 text-[#E89560]',
  'Energy Exchange': 'bg-[#6BE6A4]/15 text-[#3E3D38]',
};

export default function SavedInstructorCard({
  instructor,
  unsaving = false,
  onUnsave,
  onView,
  onMessage,
}) {
  const inst = instructor;
  const travelingTo = inst.travelingTo || inst.traveling_to || '';
  const countryFrom = inst.countryFrom || inst.country_from || inst.location || '';
  const openTo      = inst.openTo || inst.open_to || [];
  const languages   = inst.languages   || [];
  const disciplines = inst.disciplines || [];

  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-[#CE4F56]/20 overflow-hidden hover:border-[#CE4F56]/50 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              name={inst.name}
              src={inst.profile_picture}
              size="md"
              tone="coral"
            />
            <div>
              <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{inst.name}</p>
              <p className="text-[#9A9A94] text-[10px]">
                {inst.pronouns}{inst.age ? ` · ${inst.age} yrs` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUnsave?.(); }}
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
              <Chip key={d} size="xs" tone="blue">{d}</Chip>
            ))}
            {disciplines.length > 4 && (
              <Chip size="xs">+{disciplines.length - 4}</Chip>
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
                className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${OPEN_TO_TONES[o] || 'bg-[#F5F0E8] text-[#6B6B66]'}`}
              >
                {o}
              </span>
            ))}
          </div>
        )}

        {inst.bio && <p className="text-[#9A9A94] text-xs line-clamp-2">{inst.bio}</p>}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" icon={Eye} fullWidth onClick={onView}>
            View Profile
          </Button>
          <Button variant="primary" size="sm" icon={MessageCircle} fullWidth onClick={onMessage}>
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
