import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Sprout } from 'lucide-react';

import {
  fetchAdminGrowPosts,
  approveGrowPost,
  rejectGrowPost,
  boostGrowPost,
  adminDeleteGrowPost,
} from '../../store/actions/grow';
import {
  clearGrowError,
  clearGrowMessage,
} from '../../store/slices/growSlice';
import { STATUS } from '../../constants/apiConstants';
import { GROW_STATUS_TABS, GROW_TYPE_OPTIONS } from '../../constants/growConstants';

import {
  PageHeader, Toolbar, TabBar, DataTable, EmptyState, StatTileGroup,
} from '../../components/ui';
import { GrowPostRow } from '../../features/growPosts';
import {
  GrowPostPreviewModal, RejectReasonModal, ConfirmModal,
} from '../../features/modals';
import { createConversation } from '../../store/actions/messageAction';
import { buildRejectionMessage } from '../../features/modals/RejectReasonModal';

const POST_COLUMNS = [
  { key: 'post',     label: 'Post' },
  { key: 'type',     label: 'Type' },
  { key: 'postedBy', label: 'Posted by' },
  { key: 'status',   label: 'Status' },
  { key: 'actions',  label: 'Actions', align: 'right' },
];

export default function AdminGrowPosts() {
  const dispatch = useDispatch();
  const {
    adminPosts, adminStatus, adminError, moderationStatus, message,
  } = useSelector((s) => s.grow);

  const [activeStatus, setActiveStatus] = useState('pending');
  const [query,        setQuery]        = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [preview,      setPreview]      = useState(null);
  const [rejectingId,  setRejectingId]  = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [actingId,     setActingId]     = useState(null);

  useEffect(() => {
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    dispatch(fetchAdminGrowPosts(params));
  }, [dispatch, activeStatus]);

  useEffect(() => {
    if (message)    { toast.success(message);   dispatch(clearGrowMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (adminError) { toast.error(adminError);  dispatch(clearGrowError()); }
  }, [adminError, dispatch]);

  useEffect(() => {
    if (moderationStatus !== STATUS.LOADING) setActingId(null);
  }, [moderationStatus]);

  const counts = useMemo(() => {
    const c = { all: adminPosts.length, pending: 0, approved: 0, rejected: 0 };
    adminPosts.forEach((p) => { if (p.status in c) c[p.status]++; });
    return c;
  }, [adminPosts]);


  const confirmReject = async (reason) => {
  if (!rejectingId) return;
  const id = rejectingId;

  // Find the post so we can target the author for the follow-up message.
  const post = adminPosts.find((p) => p.id === id);
  const authorId = post?.user?.id || post?.user_id || null;

  setActingId(id);
  setRejectingId(null);

  const res = await dispatch(rejectGrowPost({ id, reason }));

  // Only send the inbox message if the reject call succeeded and we know who
  // the author is. Any failure here is non-fatal — the rejection still stands.
  if (rejectGrowPost.fulfilled.match(res) && authorId) {
    try {
      await dispatch(createConversation({
        recipientId: authorId,
        message:     buildRejectionMessage(reason),
      }));
    } catch (_) {
      // swallow — the admin already saw the reject success toast
    }
  }
};

  const filtered = useMemo(() => (
    adminPosts.filter((p) => {
      const matchStatus = activeStatus === 'all' || p.status === activeStatus;
      const matchType   = typeFilter === 'all'  || p.type === typeFilter;
      const q = query.toLowerCase();
      const matchQ = !q
        || (p.title       || '').toLowerCase().includes(q)
        || (p.description || '').toLowerCase().includes(q)
        || (p.location    || '').toLowerCase().includes(q)
        || (p.posted_by || p.postedBy || p.user?.name || '').toLowerCase().includes(q);
      return matchStatus && matchType && matchQ;
    })
  ), [adminPosts, activeStatus, typeFilter, query]);

  const handleApprove = async (post) => {
    setActingId(post.id);
    await dispatch(approveGrowPost(post.id));
  };


  const handleBoost = (post) =>
    dispatch(boostGrowPost({ id: post.id, is_featured: !post.is_featured }));

  const confirmDelete = async () => {
    if (!deletingPost) return;
    const id = deletingPost.id;
    setDeletingPost(null);
    setActingId(id);
    await dispatch(adminDeleteGrowPost(id));
  };

  const isLoading = adminStatus === STATUS.LOADING;
  const isDeleting = actingId === deletingPost?.id && moderationStatus === STATUS.LOADING;

  // Header KPI strip — only the first three tabs (pending/approved/rejected).
  const headerTiles = GROW_STATUS_TABS.slice(0, 3).map((s) => ({
    label: s.label,
    value: counts[s.id],
    color: `text-[${s.color}]`,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <PageHeader
        icon={Sprout}
        iconBg="#7F77DD1A"
        iconColor="#7F77DD"
        eyebrow="Admin / Grow Posts"
        eyebrowColor="#7F77DD"
        title="Moderation & Management"
        description="Approve, reject, boost, or remove retreats, trainings and events."
        actions={<StatTileGroup tiles={headerTiles} columns={3} className="min-w-[280px]" />}
      />

      <TabBar
        tabs={GROW_STATUS_TABS}
        activeId={activeStatus}
        onChange={setActiveStatus}
        counts={counts}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search title, description, location, author...',
        }}
        filters={[{
          id: 'type',
          value: typeFilter,
          onChange: setTypeFilter,
          options: GROW_TYPE_OPTIONS,
        }]}
      />

      <DataTable
        columns={POST_COLUMNS}
        rows={filtered}
        loading={isLoading}
        emptyState={<EmptyState icon={Sprout} title="Nothing to moderate" message="No posts match the current filters." />}
        renderRow={(post) => (
          <GrowPostRow
            key={post.id}
            post={post}
            actingId={actingId}
            moderationStatus={moderationStatus}
            onPreview={setPreview}
            onApprove={handleApprove}
            onReject={(p) => setRejectingId(p.id)}
            onBoost={handleBoost}
            onDelete={setDeletingPost}
          />
        )}
      />

      {preview && (
        <GrowPostPreviewModal post={preview} onClose={() => setPreview(null)} />
      )}

      <RejectReasonModal
        open={!!rejectingId}
        busy={moderationStatus === STATUS.LOADING}
        onCancel={() => setRejectingId(null)}
        onConfirm={confirmReject}
      />

      {deletingPost && (
        <ConfirmModal
          title="Delete post?"
          message={`Permanently delete "${deletingPost.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          loading={isDeleting}
          onCancel={() => setDeletingPost(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
