import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { FileText, Megaphone, Plus } from 'lucide-react';

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
  clearFieldErrors,
} from '../../store/slices/postSlice';
import { STATUS } from '../../constants/apiConstants';

import {
  Button, SearchBar, FilterSelect, TabBar, EmptyState,
} from '../../components/ui';
import { AdminPostForm } from '../../features/forms';
import { PostPreviewModal, ConfirmModal } from '../../features/modals';
import { PostCard } from '../../features/platformPosts';
import {
  POST_TYPES, POST_TYPE_TABS, POST_AUDIENCE_OPTIONS,
} from '../../constants/postConstants';

export default function AdminPosts() {
  const dispatch = useDispatch();
  const {
    posts, status: postsStatus, mutating: postMutating,
    message, error, fieldErrors,
  } = useSelector((s) => s.post);

  const [typeTab,        setTypeTab]        = useState('all');
  const [audience,       setAudience]       = useState('all');
  const [query,          setQuery]          = useState('');
  const [previewPost,    setPreviewPost]    = useState(null);
  const [formOpen,       setFormOpen]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);

  useEffect(() => {
    const params = {};
    if (typeTab  !== 'all') params.type     = typeTab;
    if (audience !== 'all') params.audience = audience;
    if (query.trim())       params.q        = query.trim();
    dispatch(fetchPosts(params));
  }, [dispatch, typeTab, audience, query]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearPostMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error)   { toast.error(error);     dispatch(clearPostError()); }
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
    if (editing) await dispatch(updatePost({ id: editing.id, ...payload }));
    else          await dispatch(createPost(payload));
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    if (previewPost?.id === target.id) setPreviewPost(null);
    setDeletingTarget(null);
    await dispatch(deletePost(target.id));
  };

  const handleTogglePublish = (post) => {
    const action = post.status === 'published' ? unpublishPost : publishPost;
    return dispatch(action(post.id));
  };

  const isLoading = postsStatus === STATUS.LOADING && posts.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
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

      {/* Type tabs */}
      <TabBar
        tabs={POST_TYPE_TABS}
        activeId={typeTab}
        onChange={setTypeTab}
        counts={counts}
      />

      {/* Search + audience filter */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search title or body..."
        />
        <FilterSelect
          value={audience}
          onChange={setAudience}
          options={POST_AUDIENCE_OPTIONS}
        />
      </div>

      {/* Grid / loading / empty */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Megaphone}
            title="No posts yet"
            message={`Click "New Post" to broadcast an announcement.`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPreview={() => setPreviewPost(post)}
              onEdit={() => { setEditing(post); setFormOpen(true); }}
              onDelete={() => setDeletingTarget(post)}
              onTogglePublish={() => handleTogglePublish(post)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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

      {previewPost && (
        <PostPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
      )}

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
