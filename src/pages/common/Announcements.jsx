import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Megaphone, Calendar, Bell, Search, X, Filter, MapPin,
  ExternalLink, Loader2, Pin, Clock,
} from 'lucide-react';
import { toast } from 'sonner';

import { fetchAnnouncements } from '../../store/actions/postAction';
import { clearPostError } from '../../store/slices/postSlice';
import { STATUS } from '../../constants/apiConstants';
import { ROLE_THEME } from '../../config/portalConfig';

const TYPE_META = {
  announcement: { label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  event:        { label: 'Event',        icon: Calendar,  color: '#E89560' },
  news:         { label: 'News',         icon: Bell,      color: '#2DA4D6' },
};

const TYPE_TABS = [
  { id: 'all',          label: 'All' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'news',         label: 'News' },
  { id: 'event',        label: 'Events' },
];

export default function Announcements() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { announcements, announcementsStatus, error } = useSelector((s) => s.post);

  const theme = ROLE_THEME[user?.role] || ROLE_THEME.instructor;

  const [typeTab, setTypeTab] = useState('all');
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    const params = {};
    if (typeTab !== 'all') params.type = typeTab;
    if (query.trim())      params.q    = query.trim();
    dispatch(fetchAnnouncements(params));
  }, [dispatch, typeTab, query]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearPostError()); }
  }, [error, dispatch]);

  const { pinned, others } = useMemo(() => {
    const p = [], o = [];
    for (const a of announcements) (a.is_pinned ? p : o).push(a);
    return { pinned: p, others: o };
  }, [announcements]);

  const isLoading = announcementsStatus === STATUS.LOADING && announcements.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: theme.accent + '15' }}>
            <Megaphone size={22} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: theme.accent }}>
              {theme.label}
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Announcements
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Platform updates, events and news from the Moving Guru team.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const active = typeTab === t.id;
          return (
            <button key={t.id} onClick={() => setTypeTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={active ? { backgroundColor: theme.accent } : {}}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4">
        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <Loader2 size={26} className="animate-spin" style={{ color: theme.accent }} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] py-16 text-center">
          <Megaphone size={36} className="mx-auto text-[#C4BCB4] mb-3" />
          <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">Nothing here yet</p>
          <p className="text-[#9A9A94] text-xs mt-1">New announcements will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase px-2">
                Pinned
              </p>
              {pinned.map((p) => <AnnouncementCard key={p.id} post={p} pinned />)}
              {others.length > 0 && (
                <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase px-2 pt-2">
                  Latest
                </p>
              )}
            </>
          )}
          {others.map((p) => <AnnouncementCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ post, pinned = false }) {
  const meta = TYPE_META[post.type] || TYPE_META.announcement;
  const TypeIcon = meta.icon;

  return (
    <article className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      {post.cover_url && (
        <div className="h-40 bg-[#FDFCF8] overflow-hidden">
          <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: meta.color }}>
            <TypeIcon size={10} /> {meta.label}
          </span>
          {pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF8E4] text-[#6B6B66]">
              <Pin size={10} /> Pinned
            </span>
          )}
          <span className="text-[10px] text-[#9A9A94] flex items-center gap-1 ml-auto">
            <Clock size={10} />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString()
              : new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
          {post.title}
        </h2>

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
                <MapPin size={12} className="text-[#E89560]" />
                {post.event_location}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-[#6B6B66] leading-relaxed whitespace-pre-line">
          {post.body}
        </p>

        {post.link_url && (
          <a href={post.link_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
            style={{ backgroundColor: meta.color }}>
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