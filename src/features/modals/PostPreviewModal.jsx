import { MapPin, Lock, X } from 'lucide-react';
import { Modal, IconButton } from '../../components/ui';
import { POST_TYPES, POST_AUDIENCE_OPTIONS as AUDIENCE_OPTIONS } from '../../constants/postConstants';

// Read-only preview of a broadcast post — shown from the admin moderation
// page so admins can see what recipients will actually see.
export default function PostPreviewModal({ post, onClose }) {
  const typeMeta = POST_TYPES.find((t) => t.id === post.type) || POST_TYPES[0];
  const TypeIcon = typeMeta.icon;
  const audienceMeta = AUDIENCE_OPTIONS.find((o) => o.id === post.audience) || AUDIENCE_OPTIONS[0];
  const AudienceIcon = audienceMeta.icon;

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      hideClose
      headerClassName="hidden"
      bodyClassName="p-0"
    >
      <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: typeMeta.color }} />

      <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}>
            <TypeIcon size={10} /> {typeMeta.label.toUpperCase()}
          </span>
          {post.status === 'published' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
              <Globe size={9} /> Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
              <Lock size={9} /> Draft
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
            <AudienceIcon size={9} /> {audienceMeta.label}
          </span>
          {post.is_pinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
              📌 PINNED
            </span>
          )}
        </div>
        <IconButton variant="plain" onClick={onClose} aria-label="Close" title="Close">
          <X size={16} />
        </IconButton>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} className="w-full max-h-64 object-cover" />
        )}

        <div className="p-6 space-y-4">
          <h2 className="font-unbounded text-xl font-black text-[#3E3D38]">{post.title}</h2>

          {post.type === 'event' && post.event_date && (
            <div className="flex items-center gap-3 text-xs text-[#6B6B66]">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} /> {new Date(post.event_date).toLocaleString()}
              </span>
              {post.event_location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> {post.event_location}
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">{post.body}</p>

          {post.link_url && (
            <a href={post.link_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7F77DD] text-white text-xs font-bold hover:bg-[#6c64c8]">
              {post.link_label || 'Open link'} →
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
