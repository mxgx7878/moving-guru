import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { Modal, Chip, StatusPill, LabeledBlock } from '../../components/ui';
import { GROW_TYPE_META, GROW_STATUS_CONFIG } from './growConfig';

// Read-only preview modal for a grow post — used by admins to vet a
// submission before approving/rejecting. Uses the shared Modal shell
// for consistent backdrop/escape/close behaviour.
export default function GrowPostPreviewModal({ post, onClose }) {
  if (!post) return null;

  const meta     = GROW_TYPE_META[post.type] || GROW_TYPE_META.event;
  const TypeIcon = meta.icon;
  const postedBy = post.posted_by || post.postedBy || post.user?.name || '—';
  const externalUrl = post.external_url || post.url;
  const hasExternal = externalUrl && externalUrl !== '#';

  const headerBadges = (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
        style={{ backgroundColor: meta.color + '20', color: meta.color }}
      >
        <TypeIcon size={10} /> {meta.label}
      </span>
      <StatusPill status={post.status} config={GROW_STATUS_CONFIG} size="xs" />
      {post.is_featured && (
        <Chip size="xs" className="bg-[#f5fca6] text-[#3E3D38]">⚡ FEATURED</Chip>
      )}
    </div>
  );

  return (
    <Modal open size="lg" onClose={onClose} headerClassName="px-6 py-4" title={null}>
      {/* Custom thin accent bar — visually ties preview to post type */}
      <div
        className="-mx-6 -mt-6 mb-4 h-1 rounded-t-2xl"
        style={{ backgroundColor: post.color || meta.color }}
      />

      {headerBadges}

      <div className="mt-4">
        <h2 className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">{post.title}</h2>
        {post.subtitle && <p className="text-[#6B6B66] text-sm mt-1">{post.subtitle}</p>}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[#6B6B66] mt-4">
        {post.location && <span className="flex items-center gap-1"><MapPin size={12} /> {post.location}</span>}
        {(post.date_from || post.dates) && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {post.dates || `${post.date_from} – ${post.date_to || ''}`}
          </span>
        )}
        {(post.spots_left ?? post.spotsLeft) !== undefined && (
          <span className="flex items-center gap-1">
            <Users size={12} /> {post.spots_left ?? post.spotsLeft} spots
          </span>
        )}
      </div>

      <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed mt-4">
        {post.description}
      </p>

      {(post.disciplines || []).length > 0 && (
        <LabeledBlock label="Disciplines" className="mt-4">
          <div className="flex flex-wrap gap-1.5">
            {post.disciplines.map((d) => <Chip key={d} size="xs">{d}</Chip>)}
          </div>
        </LabeledBlock>
      )}

      {(post.tags || []).length > 0 && (
        <LabeledBlock label="Tags" className="mt-4">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => <Chip key={t} size="xs">{t}</Chip>)}
          </div>
        </LabeledBlock>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0EBE3] text-xs mt-4">
        <div>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Posted by</p>
          <p className="font-semibold text-[#3E3D38]">{postedBy}</p>
        </div>
        {post.price && (
          <div>
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Price</p>
            <p className="font-semibold text-[#3E3D38]">{post.price}</p>
          </div>
        )}
        {hasExternal && (
          <div className="col-span-2">
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">External link</p>
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#7F77DD] font-semibold hover:underline"
            >
              {externalUrl} <ExternalLink size={11} />
            </a>
          </div>
        )}
        {post.rejection_reason && (
          <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-[10px] text-red-600 uppercase tracking-wide font-bold">Rejection Reason</p>
            <p className="text-xs text-red-700 mt-0.5">{post.rejection_reason}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
