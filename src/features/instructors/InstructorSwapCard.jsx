import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, RefreshCw, Eye } from 'lucide-react';
import { Avatar, Button, Chip } from '../../components/ui';

/**
 * InstructorSwapCard
 * ─────────────────────────────────────────────────────────────
 * Card rendered on the instructor Find Work feed for peers who are
 * open to a swap. Sibling to the studio-side SavedInstructorCard but
 * stripped of save/unsave (instructors don't have a favourites list).
 *
 * `onMessage` is supplied by the parent so messaging stays a parent
 * concern (matches how InstructorJobCard.onApply works).
 */
export default function InstructorSwapCard({ instructor, onMessage }) {
  const inst        = instructor;
  const detail      = inst.detail || inst;
  const disciplines = detail.disciplines || [];
  const countryFrom = detail.countryFrom || detail.country_from || detail.location || '';
  const travelingTo = detail.travelingTo || detail.traveling_to || '';
  const profilePic  = detail.profile_picture_url || detail.profile_picture;
  const bio         = detail.bio || '';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 hover:border-[#E89560]/40 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <Avatar name={inst.name} src={profilePic} size="lg" tone="coral" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-unbounded text-sm font-black text-[#3E3D38] truncate">
                {inst.name}
              </h3>
              {(countryFrom || travelingTo) && (
                <p className="text-[#9A9A94] text-xs mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  <span className="truncate">
                    {countryFrom}{travelingTo && ` → ${travelingTo}`}
                  </span>
                </p>
              )}
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[#E89560]">
              <RefreshCw size={10} /> Open to Swap
            </span>
          </div>

          {bio && (
            <p className="text-[#6B6B66] text-xs mt-3 line-clamp-2">{bio}</p>
          )}

          {disciplines.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {disciplines.slice(0, 4).map((d) => (
                <Chip key={d} size="xs" tone="blue">{d}</Chip>
              ))}
              {disciplines.length > 4 && (
                <Chip size="xs">+{disciplines.length - 4}</Chip>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-3 border-t border-[#E5E0D8]">
            <Link to={`/portal/instructors/${inst.id}`} className="flex-1">
              <Button variant="secondary" size="sm" icon={Eye} fullWidth>
                View Profile
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={MessageCircle}
              fullWidth
              onClick={() => onMessage?.(inst)}
            >
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}