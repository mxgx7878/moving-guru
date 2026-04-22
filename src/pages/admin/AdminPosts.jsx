import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  FileText, Calendar, Megaphone, Bell, Plus, Search, X, Filter,
  Eye, Edit3, Trash2, Send, EyeOff, Loader2, MapPin, Clock,
  Globe, Lock, Users, Building2,
} from 'lucide-react';

import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from '../../store/actions/postAction';
import {
  clearPostError,
  clearPostMessage,
} from '../../store/slices/postSlice';
import { STATUS } from '../../constants/apiConstants';
import { Button } from '../../components/ui';
import { AdminPostForm } from '../../features/forms';
import { PostPreviewModal, ConfirmModal } from '../../features/modals';

// ── Tabs / meta ────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone, color: '#7F77DD' },
  { id: 'event',        label: 'Event',        icon: Calendar,  color: '#E89560' },
  { id: 'news',         label: 'News',         icon: Bell,      color: '#2DA4D6' },
];
const TYPE_TABS = [{ id: 'all', label: 'All', icon: FileText, color: '#3E3D38' }, ...POST_TYPES];
const AUDIENCE_OPTIONS = [
  { id: 'all',         label: 'Everyone',    icon: Globe },
  { id: 'instructors', label: 'Instructors', icon: Users },
  { id: 'studios',     label: 'Studios',     icon: Building2 },
];

export default function AdminPosts() {
  const dispatch = useDispatch();
  const {
    posts, status: postsStatus, mutating: postMutating,
    message, error, fieldErrors,
  } = useSelector((s) => s.post);


  const [typeTab, setTypeTab]         = useState('all');
  const [audience, setAudience]       = useState('all');
  const [query, setQuery]             = useState('');
  const [previewPost, setPreviewPost] = useState(null);
  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);

  useEffect(() => {
    const params = {};
    if (typeTab  !== 'all') params.type     = typeTab;
    if (audience !== 'all') params.audience = audience;
    if (query.trim())        params.q        = query.trim();
    dispatch(fetchPosts(params));
  }, [dispatch, typeTab, audience, query]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearPostMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearPostError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (postMutating === STATUS.SUCCEEDED) {
      setFormOpen(false);
      setEditing(null);
    }
  }, [postMutating]);

  const counts = useMemo(() => {
    const c = { all: posts.length };
    POST_TYPES.forEach((t) => { c[t.id] = posts.filter((p) => p.type === t.id).length; });
    return c;
  }, [posts]);

 const handleSubmit = async (payload) => {
    if (editing) {
      await dispatch(updatePost({ id: editing.id, ...payload }));
    } else {
      await dispatch(createPost(payload));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    if (previewPost?.id === target.id) setPreviewPost(null);
    setDeletingTarget(null);

    // Error surfaces via toast through the existing error useEffect.
    await dispatch(deletePost(target.id));
  };
  
  const handleTogglePublish = async (post) => {
    console.log('Toggling publish for post', post);
    const action = post.status === 'published' ? unpublishPost : publishPost;
    await dispatch(action(post.id));
  };

  const isLoading = postsStatus === STATUS.LOADING && posts.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center">
            <FileText size={22} className="text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Announcements
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Platform Announcements
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Broadcast announcements, news and events to instructors and studios.
            </p>
          </div>
        </div>

        <Button variant="accent" icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>
          New Post
        </Button>
      </div>

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
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                {counts[t.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

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
              onEdit={() => { setEditing(post); setFormOpen(true); }}
              onDelete={() => setDeletingTarget(post)}
              onTogglePublish={() => handleTogglePublish(post)}
            />
          ))}
        </div>
      )}

      {formOpen && (
         <AdminPostForm
          post={editing}
          saving={postMutating === STATUS.LOADING}
          fieldErrors={fieldErrors}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
            dispatch(clearFieldErrors());
          }}
          onSubmit={handleSubmit}
        />
      )}

      {previewPost && <PostPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />}

      {deletingTarget && (
        <ConfirmModal
          title="Delete post?"
          message={`Delete "${deletingTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

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
            <IconBtn title="Preview" onClick={onPreview}><Eye size={13} /></IconBtn>
            <IconBtn title="Edit" onClick={onEdit}><Edit3 size={13} /></IconBtn>
            <IconBtn
              title={isPublished ? 'Unpublish' : 'Publish'}
              onClick={onTogglePublish}
              color={isPublished ? 'green-active' : 'green'}>
              {isPublished ? <EyeOff size={13} /> : <Send size={13} />}
            </IconBtn>
            <IconBtn title="Delete" onClick={onDelete} color="red"><Trash2 size={13} /></IconBtn>
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
