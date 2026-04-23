import {
  Calendar, MapPin, Clock, Eye, Edit3, EyeOff, Send, Trash2,
} from 'lucide-react';
import { IconButton } from '../../components/ui';
import { POST_TYPES } from '../../constants/postConstants';
import PublishPill from './PublishPill';
import AudiencePill from './AudiencePill';

// Card used in the admin announcements grid. All action callbacks are
// optional; callers typically set up preview / edit / delete / toggle.
export default function PostCard({
  post,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const typeMeta = POST_TYPES.find((t) => t.id === post.type) || POST_TYPES[0];
  const TypeIcon = typeMeta.icon;
  const isPublished = post.status === 'published';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-1 w-full" style={{ backgroundColor: typeMeta.color }} />

      {post.cover_url && (
        <img
          src={post.cover_url}
          alt={post.title}
          className="w-full h-32 object-cover border-b border-[#E5E0D8]"
        />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}
          >
            <TypeIcon size={9} /> {typeMeta.label.toUpperCase()}
          </span>
          {post.is_pinned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
              📌 PINNED
            </span>
          )}
          <AudiencePill audience={post.audience} />
          <PublishPill status={post.status} />
        </div>

        <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] line-clamp-2 mb-1.5">
          {post.title}
        </h3>

        {post.type === 'event' && post.event_date && (
          <div className="flex items-center gap-3 text-[11px] text-[#6B6B66] mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {new Date(post.event_date).toLocaleDateString()}
            </span>
            {post.event_location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {post.event_location}
              </span>
            )}
          </div>
        )}

        <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
          {post.body}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
          <span className="text-[10px] text-[#9A9A94] flex items-center gap-1">
            <Clock size={10} />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString()
              : post.created_at
                ? `Drafted ${new Date(post.created_at).toLocaleDateString()}`
                : '—'}
          </span>
          <div className="flex items-center gap-1.5">
            <IconButton title="Preview" onClick={onPreview}><Eye size={13} /></IconButton>
            <IconButton title="Edit" onClick={onEdit}><Edit3 size={13} /></IconButton>
            <IconButton
              title={isPublished ? 'Unpublish' : 'Publish'}
              onClick={onTogglePublish}
              tone={isPublished ? 'green-active' : 'green'}
            >
              {isPublished ? <EyeOff size={13} /> : <Send size={13} />}
            </IconButton>
            <IconButton title="Delete" onClick={onDelete} tone="red">
              <Trash2 size={13} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
