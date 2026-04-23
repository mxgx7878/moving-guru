import {
  Calendar, MapPin, Users, ExternalLink, Edit3, Trash2,
} from 'lucide-react';
import { Chip, IconButton, StatusPill } from '../../components/ui';
import {
  GROW_TYPE_META, GROW_TYPE_BG, GROW_STATUS_PUBLIC_CONFIG,
} from '../../constants/growConstants';

// Card shown on the public Grow feed. Distinct from GrowPostRow (admin
// moderation table row) and GrowPostPreviewModal (read-only dialog).
// Handles status badge (for authors/admins), owner actions, and the
// external "More Info" link.
export default function GrowPostCard({
  post,
  showStatus = false,
  ownerActions = false,
  onEdit,
  onDelete,
}) {
  const typeCfg  = GROW_TYPE_META[post.type];
  const TypeIcon = typeCfg?.icon || Calendar;
  const postedBy = post.posted_by || post.postedBy || post.user?.name || '—';
  const externalUrl = post.external_url || post.url;
  const hasExternal = externalUrl && externalUrl !== '#';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-1 w-full" style={{ backgroundColor: post.color || typeCfg?.color || '#2DA4D6' }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${GROW_TYPE_BG[post.type] || ''}`}>
                <TypeIcon size={9} /> {(post.type || '').toUpperCase()}
              </span>
              {post.is_featured && (
                <Chip size="xs" className="bg-[#f5fca6] text-[#3E3D38]">⚡ FEATURED</Chip>
              )}
              {showStatus && (
                <StatusPill status={post.status} config={GROW_STATUS_PUBLIC_CONFIG} size="xs" />
              )}
            </div>
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] leading-tight line-clamp-2">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="text-[#9A9A94] text-xs mt-0.5">{post.subtitle}</p>
            )}
          </div>

          {post.images?.[0] && (
            <img src={post.images[0]} alt={post.title}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#E5E0D8]" />
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.location && (
            <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
              <MapPin size={11} className="text-[#9A9A94]" /> {post.location}
            </span>
          )}
          {(post.date_from || post.dates) && (
            <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
              <Calendar size={11} className="text-[#9A9A94]" />
              {post.dates || `${post.date_from} – ${post.date_to || ''}`}
            </span>
          )}
          {(post.spots_left ?? post.spotsLeft) !== undefined && (
            <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
              <Users size={11} className="text-[#9A9A94]" />
              {post.spots_left ?? post.spotsLeft} spots left
            </span>
          )}
        </div>

        <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
          {post.description}
        </p>

        {(post.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => <Chip key={tag} size="xs">{tag}</Chip>)}
          </div>
        )}

        {/* Footer: owner + actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
          <div>
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Posted by</p>
            <p className="text-xs font-semibold text-[#3E3D38]">{postedBy}</p>
            {post.price && (
              <p className="text-xs font-bold mt-0.5" style={{ color: post.color || typeCfg?.color }}>
                {post.price}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ownerActions && (
              <>
                <IconButton title="Edit post" onClick={() => onEdit?.(post)}>
                  <Edit3 size={13} />
                </IconButton>
                <IconButton title="Delete post" tone="red" onClick={() => onDelete?.(post)}>
                  <Trash2 size={13} />
                </IconButton>
              </>
            )}

            {hasExternal && (
              <a href={externalUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
                style={{ backgroundColor: post.color || typeCfg?.color || '#3E3D38' }}>
                More Info <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
