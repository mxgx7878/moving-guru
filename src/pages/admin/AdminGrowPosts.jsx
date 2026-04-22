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

import {
  SearchBar, FilterSelect, TabBar, EmptyState,
} from '../../components/ui';
import {
  GrowPostRow, GrowPostPreviewModal, RejectReasonModal,
} from '../../features/growPosts';
import { GROW_STATUS_TABS, GROW_TYPE_OPTIONS } from '../../constants/growConstants';
import { ConfirmModal } from '../../features/modals';

export default function AdminGrowPosts() {
  const dispatch = useDispatch();
  const {
    adminPosts, adminStatus, adminError, moderationStatus, message,
  } = useSelector((s) => s.grow);

  const [activeStatus, setActiveStatus] = useState('pending');
  const [query,        setQuery]        = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [preview,      setPreview]      = useState(null);   // post being previewed
  const [rejectingId,  setRejectingId]  = useState(null);   // post pending reject dialog
  const [deletingPost, setDeletingPost] = useState(null);   // post pending delete confirm
  const [actingId,     setActingId]     = useState(null);   // id currently being moderated

  // ── Load posts on mount & when filter changes ──────────────────
  useEffect(() => {
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    dispatch(fetchAdminGrowPosts(params));
  }, [dispatch, activeStatus]);

  // ── Toast feedback ─────────────────────────────────────────────
  useEffect(() => {
    if (message)    { toast.success(message);   dispatch(clearGrowMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (adminError) { toast.error(adminError);  dispatch(clearGrowError()); }
  }, [adminError, dispatch]);

  // Reset actingId once moderation settles
  useEffect(() => {
    if (moderationStatus !== STATUS.LOADING) setActingId(null);
  }, [moderationStatus]);

  // ── Derived ────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const c = { all: adminPosts.length, pending: 0, approved: 0, rejected: 0 };
    adminPosts.forEach((p) => { if (p.status in c) c[p.status]++; });
    return c;
  }, [adminPosts]);

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

  // ── Handlers ───────────────────────────────────────────────────
  const handleApprove = async (post) => {
    setActingId(post.id);
    await dispatch(approveGrowPost(post.id));
  };

  const confirmReject = async (reason) => {
    if (!rejectingId) return;
    const id = rejectingId;
    setActingId(id);
    setRejectingId(null);
    await dispatch(rejectGrowPost({ id, reason }));
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7F77DD]/10 rounded-2xl flex items-center justify-center">
            <Sprout size={22} className="text-[#7F77DD]" />
          </div>
          <div>
            <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Grow Posts
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Moderation &amp; Management
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Approve, reject, boost, or remove retreats, trainings and events.
            </p>
          </div>
        </div>

        {/* Status stat cards (pending / approved / rejected) */}
        <div className="flex gap-3">
          {GROW_STATUS_TABS.slice(0, 3).map((s) => (
            <div key={s.id}
              className="px-4 py-2 rounded-xl border border-[#E5E0D8] text-center min-w-[80px]">
              <p className="font-['Unbounded'] text-lg font-black" style={{ color: s.color }}>
                {counts[s.id]}
              </p>
              <p className="text-[10px] font-semibold text-[#9A9A94] uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status tabs ─────────────────────────────────────── */}
      <TabBar
        tabs={GROW_STATUS_TABS}
        activeId={activeStatus}
        onChange={setActiveStatus}
        counts={counts}
      />

      {/* ── Search + type filter ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search title, description, location, author..."
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={GROW_TYPE_OPTIONS}
        />
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="Nothing to moderate"
            message="No posts match the current filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCF8] text-left">
                <tr className="text-[10px] text-[#9A9A94] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Post</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Posted by</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview ─────────────────────────────────────────── */}
      {preview && (
        <GrowPostPreviewModal post={preview} onClose={() => setPreview(null)} />
      )}

      {/* ── Reject reason prompt ────────────────────────────── */}
      <RejectReasonModal
        open={!!rejectingId}
        busy={moderationStatus === STATUS.LOADING}
        onCancel={() => setRejectingId(null)}
        onConfirm={confirmReject}
      />

      {/* ── Delete confirmation ─────────────────────────────── */}
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
