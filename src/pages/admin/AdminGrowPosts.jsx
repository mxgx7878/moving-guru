import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Sprout, Plus, Trash2 } from 'lucide-react';

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
import { API_ENDPOINTS, STATUS } from '../../constants/apiConstants';
import axiosInstance from '../../config/axiosInstance';
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
  const [tiers, setTiers] = useState([]);
  const [tierSaving, setTierSaving] = useState(false);
  const [tierForm, setTierForm] = useState({
    name: '', description: '', price: '', currency: 'AUD', duration_days: '', sort_order: 0,
  });

  const loadTiers = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_GROW_POST_TIERS);
      setTiers(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load Grow pricing tiers.');
    }
  }, []);

  useEffect(() => { loadTiers(); }, [loadTiers]);

  const createTier = async (event) => {
    event.preventDefault();
    setTierSaving(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADMIN_GROW_POST_TIERS, {
        ...tierForm,
        price: Number(tierForm.price),
        duration_days: Number(tierForm.duration_days),
        sort_order: Number(tierForm.sort_order || 0),
        is_active: true,
      });
      setTierForm({ name: '', description: '', price: '', currency: 'AUD', duration_days: '', sort_order: 0 });
      await loadTiers();
      toast.success('Grow pricing tier created.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create Grow tier.');
    } finally {
      setTierSaving(false);
    }
  };

  const archiveTier = async (id) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_GROW_POST_TIERS}/${id}`);
      await loadTiers();
      toast.success('Grow pricing tier archived.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not archive Grow tier.');
    }
  };

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
        iconBg="#4E7A1B1A"
        iconColor="#4E7A1B"
        eyebrow="Admin / Grow Posts"
        eyebrowColor="#4E7A1B"
        title="Moderation & Management"
        description="Approve, reject, boost, or remove retreats, trainings and events."
        actions={<StatTileGroup tiles={headerTiles} columns={3} className="min-w-[280px]" />}
      />

      <section className="rounded-2xl border border-[#E5E0D8] bg-white p-5 space-y-4">
        <div>
          <h2 className="font-unbounded text-sm font-black">Grow post pricing tiers</h2>
          <p className="text-xs text-[#6B6B66] mt-1">These server-controlled prices are shown to registered and public publishers.</p>
        </div>

        <form onSubmit={createTier} className="grid md:grid-cols-6 gap-2">
          <input required placeholder="Tier name" value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
          <input placeholder="Description" value={tierForm.description} onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })} className="rounded-xl border px-3 py-2 text-sm md:col-span-2" />
          <input required type="number" min="0.5" step="0.01" placeholder="Price" value={tierForm.price} onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
          <input required type="number" min="1" placeholder="Days" value={tierForm.duration_days} onChange={(e) => setTierForm({ ...tierForm, duration_days: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
          <button disabled={tierSaving} className="rounded-xl bg-[#B4FF5A] px-3 py-2 text-xs font-black flex items-center justify-center gap-1 disabled:opacity-50"><Plus size={14} /> Add tier</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => (
            <div key={tier.id} className={`rounded-xl border px-3 py-2 flex items-center gap-3 ${tier.is_active ? '' : 'opacity-50'}`}>
              <div>
                <p className="text-xs font-black">{tier.name} · {tier.currency} ${Number(tier.price).toFixed(2)}</p>
                <p className="text-[10px] text-[#6B6B66]">{tier.duration_days} days</p>
              </div>
              {tier.is_active && <button type="button" title="Archive tier" onClick={() => archiveTier(tier.id)} className="text-red-600"><Trash2 size={13} /></button>}
            </div>
          ))}
        </div>
      </section>

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
