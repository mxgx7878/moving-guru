import { Clock, Pin, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { POST_TYPE_META } from '../../constants/postConstants';
import { formatShortDate } from '../../utils/formatters';

// Public-portal card used on the Announcements page. Distinct from
// PostCard (admin moderation grid) — this is the reader-facing version
// with hero image, action link, and author byline.
export default function AnnouncementCard({ post, pinned = false }) {
  const meta = POST_TYPE_META[post.type] || POST_TYPE_META.announcement;
  const TypeIcon = meta.icon;
  const publishedAt = post.published_at || post.created_at;

  return (
    <article className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      {post.cover_url && (
        <div className="h-40 bg-[#FDFCF8] overflow-hidden">
          <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: meta.color }}
          >
            <TypeIcon size={10} /> {meta.label}
          </span>
          {pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF8E4] text-[#6B6B66]">
              <Pin size={10} /> Pinned
            </span>
          )}
          <span className="text-[10px] text-[#9A9A94] flex items-center gap-1 ml-auto">
            <Clock size={10} /> {formatShortDate(publishedAt)}
          </span>
        </div>

        <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">{post.title}</h2>

        {post.type === 'event' && (post.event_date || post.event_location) && (
          <div className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3 flex flex-wrap gap-4 text-xs text-[#3E3D38]">
            {post.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[#E89560]" />
                {new Date(post.event_date).toLocaleString([], {
                  dateStyle: 'medium', timeStyle: 'short',
                })}
              </span>
            )}
            {post.event_location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#E89560]" /> {post.event_location}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-[#6B6B66] leading-relaxed whitespace-pre-line">
          {post.body}
        </p>

        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
            style={{ backgroundColor: meta.color }}
          >
            {post.link_label || 'Learn more'} <ExternalLink size={11} />
          </a>
        )}

        {post.author?.name && (
          <p className="text-[10px] text-[#9A9A94] pt-1 border-t border-[#F0EBE3]">
            Posted by {post.author.name}
          </p>
        )}
      </div>
    </article>
  );
}
