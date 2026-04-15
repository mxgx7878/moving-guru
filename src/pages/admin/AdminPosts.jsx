import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  FileText, Calendar, Megaphone, Bell, Plus, Search, X, Filter,
  Eye, Edit3, Trash2, Send, EyeOff, Loader2, MapPin, Clock,
  Globe, Lock, Users, Building2,
} from 'lucide-react';

import {
  fetchAdminPosts,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
  publishAdminPost,
  unpublishAdminPost,
} from '../../store/actions/admin';
import { clearAdminError, clearAdminMessage } from '../../store/slices/adminSlice';
import { STATUS } from '../../constants/apiConstants';

// ── Constants ────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#E89560' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#2DA4D6' },
];

const TYPE_TABS = [
  { id: 'all',          label: 'All',          icon: FileText,  color: '#3E3D38' },
  ...POST_TYPES,
];

const AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

const EMPTY_FORM = {
  type:        'announcement',
  title:       '',
  body:        '',
  audience:    'all',
  cover_url:   '',
  link_url:    '',
  link_label:  '',
  event_date:  '',
  event_location: '',
  is_pinned:   false,
};

const postToForm = (p) => ({
  type:        p.type        || 'announcement',
  title:       p.title       || '',
  body:        p.body        || '',
  audience:    p.audience    || 'all',
  cover_url:   p.cover_url   || '',
  link_url:    p.link_url    || '',
  link_label:  p.link_label  || '',
  event_date:  p.event_date  || '',
  event_location: p.event_location || '',
  is_pinned:   Boolean(p.is_pinned),
});

// ── Component ────────────────────────────────────────────────────
export default function AdminPosts() {
  const dispatch = useDispatch();
  const {
    posts, postsStatus, postMutating, message, error,
  } = useSelector((s) => s.admin);

  const [typeTab,    setTypeTab]    = useState('all');
  const [audience,   setAudience]   = useState('all');
  const [query,      setQuery]      = useState('');
  const [previewPost, setPreviewPost] = useState(null);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editing,    setEditing]    = useState(null);

  // ── Load posts when filter changes ─────────────────────────────
  useEffect(() => {
    const params = {};
    if (typeTab  !== 'all') params.type     = typeTab;
    if (audience !== 'all') params.audience = audience;
    if (query.trim())        params.q        = query.trim();
    dispatch(fetchAdminPosts(params));
  }, [dispatch, typeTab, audience, query]);

  // ── Toast feedback ─────────────────────────────────────────────
  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearAdminMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearAdminError()); }
  }, [error, dispatch]);

  // Close form when a mutation succeeds
  useEffect(() => {
    if (postMutating === STATUS.SUCCEEDED) {
      setFormOpen(false);
      setEditing(null);
    }
  }, [postMutating]);

  // ── Counts per type ───────────────────────────────────────────
  const counts = useMemo(() => {
    const c = { all: posts.length };
    POST_TYPES.forEach((t) => { c[t.id] = posts.filter((p) => p.type === t.id).length; });
    return c;
  }, [posts]);

  // ── Handlers ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setFormOpen(true);
  };

  const handleSubmit = (payload) => {
    if (editing) dispatch(updateAdminPost({ id: editing.id, ...payload }));
    else         dispatch(createAdminPost(payload));
  };

  const handleDelete = (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    dispatch(deleteAdminPost(post.id));
    if (previewPost?.id === post.id) setPreviewPost(null);
  };

  const handleTogglePublish = (post) => {
    if (post.status === 'published') dispatch(unpublishAdminPost(post.id));
    else                              dispatch(publishAdminPost(post.id));
  };

  const isLoading = postsStatus === STATUS.LOADING && posts.length === 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center">
            <FileText size={22} className="text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Posts &amp; Events
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Platform Announcements
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Broadcast announcements, news and events to instructors and studios.
            </p>
          </div>
        </div>

        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#3E3D38] text-[#f5fca6] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-black transition-colors">
          <Plus size={14} /> New Post
        </button>
      </div>

      {/* ── Type tabs ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const Icon = t.icon;
          const active = typeTab === t.id;
          return (
            <button key={t.id} onClick={() => setTypeTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
                ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={active ? { backgroundColor: t.color } : {}}>
              <Icon size={13} /> {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                {counts[t.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + audience filter ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or body..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#9A9A94]" />
          <select value={audience} onChange={(e) => setAudience(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2">
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <Loader2 size={26} className="animate-spin text-[#F59E0B]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] py-16 text-center">
          <Megaphone size={36} className="mx-auto text-[#C4BCB4] mb-3" />
          <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">No posts yet</p>
          <p className="text-[#9A9A94] text-xs mt-1">
            Click &quot;New Post&quot; to broadcast an announcement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post}
              onPreview={() => setPreviewPost(post)}
              onEdit={() => openEdit(post)}
              onDelete={() => handleDelete(post)}
              onTogglePublish={() => handleTogglePublish(post)}
            />
          ))}
        </div>
      )}

      {/* ── Form Modal ───────────────────────────────────────── */}
      {formOpen && (
        <PostFormModal
          post={editing}
          saving={postMutating === STATUS.LOADING}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {/* ── Preview Modal ────────────────────────────────────── */}
      {previewPost && (
        <PreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function PostCard({ post, onPreview, onEdit, onDelete, onTogglePublish }) {
  const typeMeta = POST_TYPES.find((t) => t.id === post.type) || POST_TYPES[0];
  const TypeIcon = typeMeta.icon;
  const isPublished = post.status === 'published';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-1 w-full" style={{ backgroundColor: typeMeta.color }} />

      {post.cover_url && (
        <img src={post.cover_url} alt={post.title}
          className="w-full h-32 object-cover border-b border-[#E5E0D8]" />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}>
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
            <IconBtn title="Preview" onClick={onPreview}>
              <Eye size={13} />
            </IconBtn>
            <IconBtn title="Edit" onClick={onEdit}>
              <Edit3 size={13} />
            </IconBtn>
            <IconBtn
              title={isPublished ? 'Unpublish' : 'Publish'}
              onClick={onTogglePublish}
              color={isPublished ? 'green-active' : 'green'}>
              {isPublished ? <EyeOff size={13} /> : <Send size={13} />}
            </IconBtn>
            <IconBtn title="Delete" onClick={onDelete} color="red">
              <Trash2 size={13} />
            </IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostFormModal({ post, saving, onClose, onSubmit }) {
  const isEditing = Boolean(post);
  const [form, setForm] = useState(() => post ? postToForm(post) : EMPTY_FORM);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.body.trim())  return toast.error('Body is required');
    if (form.type === 'event' && !form.event_date) {
      return toast.error('Event date is required for event posts');
    }

    onSubmit({
      type:           form.type,
      title:          form.title.trim(),
      body:           form.body.trim(),
      audience:       form.audience,
      cover_url:      form.cover_url.trim() || null,
      link_url:       form.link_url.trim()  || null,
      link_label:     form.link_label.trim() || null,
      event_date:     form.event_date     || null,
      event_location: form.event_location.trim() || null,
      is_pinned:      Boolean(form.is_pinned),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <form onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">

        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h2>
            <p className="text-[10px] text-[#9A9A94] mt-0.5">
              Published posts are visible immediately to the selected audience.
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Type */}
          <FieldLabel label="Type *">
            <div className="flex gap-2">
              {POST_TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.type === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => update('type', t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                      ${active ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                    style={active ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                    <Icon size={12} /> {t.label}
                  </button>
                );
              })}
            </div>
          </FieldLabel>

          <FieldLabel label="Title *">
            <input value={form.title} onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. New Job Listings filter is now live"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
          </FieldLabel>

          <FieldLabel label="Body *">
            <textarea value={form.body} onChange={(e) => update('body', e.target.value)}
              rows={5} placeholder="Write the announcement, news update or event details here..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD] resize-none" />
          </FieldLabel>

          <FieldLabel label="Audience *">
            <div className="flex gap-2">
              {AUDIENCE_OPTIONS.map((o) => {
                const Icon = o.icon;
                const active = form.audience === o.id;
                return (
                  <button key={o.id} type="button" onClick={() => update('audience', o.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all
                      ${active ? 'bg-[#7F77DD] text-white border-[#7F77DD]' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}>
                    <Icon size={12} /> {o.label}
                  </button>
                );
              })}
            </div>
          </FieldLabel>

          {form.type === 'event' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldLabel label="Event date *">
                <input type="datetime-local" value={form.event_date}
                  onChange={(e) => update('event_date', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
              </FieldLabel>
              <FieldLabel label="Event location">
                <input value={form.event_location}
                  onChange={(e) => update('event_location', e.target.value)}
                  placeholder="e.g. Online · Zoom or Bangkok, Thailand"
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
              </FieldLabel>
            </div>
          )}

          <FieldLabel label="Cover image URL">
            <input value={form.cover_url} onChange={(e) => update('cover_url', e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
          </FieldLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel label="Call-to-action URL">
              <input value={form.link_url} onChange={(e) => update('link_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
            </FieldLabel>
            <FieldLabel label="Button label">
              <input value={form.link_label} onChange={(e) => update('link_label', e.target.value)}
                placeholder="e.g. Learn more"
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD]" />
            </FieldLabel>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#3E3D38] cursor-pointer">
            <input type="checkbox" checked={form.is_pinned}
              onChange={(e) => update('is_pinned', e.target.checked)}
              className="w-4 h-4 accent-[#7F77DD]" />
            Pin this post to the top of feeds
          </label>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E0D8] flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#6B6B66] hover:bg-[#F5F0E8]">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#7F77DD] hover:bg-[#6c64c8] disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PreviewModal({ post, onClose }) {
  const typeMeta = POST_TYPES.find((t) => t.id === post.type) || POST_TYPES[0];
  const TypeIcon = typeMeta.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: typeMeta.color }} />

        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}>
              <TypeIcon size={10} /> {typeMeta.label.toUpperCase()}
            </span>
            <PublishPill status={post.status} />
            <AudiencePill audience={post.audience} />
            {post.is_pinned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                📌 PINNED
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#FBF8E4] rounded-lg text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {post.cover_url && (
            <img src={post.cover_url} alt={post.title}
              className="w-full max-h-64 object-cover" />
          )}

          <div className="p-6 space-y-4">
            <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{post.title}</h2>

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

            <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
              {post.body}
            </p>

            {post.link_url && (
              <a href={post.link_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7F77DD] text-white text-xs font-bold hover:bg-[#6c64c8]">
                {post.link_label || 'Open link'} →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishPill({ status }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
        <Globe size={9} /> Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
      <Lock size={9} /> Draft
    </span>
  );
}

function AudiencePill({ audience }) {
  const meta = AUDIENCE_OPTIONS.find((o) => o.id === audience) || AUDIENCE_OPTIONS[0];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
      <Icon size={9} /> {meta.label}
    </span>
  );
}

function IconBtn({ children, title, onClick, color = 'default' }) {
  const colorCls = {
    default:        'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]',
    green:          'border-[#E5E0D8] text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500',
    'green-active': 'border-emerald-500 text-emerald-600 bg-emerald-50',
    red:            'border-[#E5E0D8] text-red-500 hover:bg-red-50 hover:border-red-500',
  }[color];
  return (
    <button type="button" title={title} onClick={onClick}
      className={`p-1.5 rounded-lg border transition-colors ${colorCls}`}>
      {children}
    </button>
  );
}

function FieldLabel({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
