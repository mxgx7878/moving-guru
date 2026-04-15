import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Sprout, Search, X, Filter, CheckCircle2, AlertCircle,
  Clock, Loader2, Trash2, Star, Eye, ExternalLink,
  BookOpen, Palmtree, Calendar, MapPin, Users,
} from 'lucide-react';

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
  locallySetGrowStatus,
  locallyToggleGrowFeatured,
  locallyDeleteGrow,
} from '../../store/slices/growSlice';
import { STATUS } from '../../constants/apiConstants';

// ── Constants ────────────────────────────────────────────────────
const TYPE_META = {
  training: { label: 'Training', icon: BookOpen, color: '#2DA4D6' },
  retreat:  { label: 'Retreat',  icon: Palmtree, color: '#6BE6A4' },
  event:    { label: 'Event',    icon: Calendar, color: '#E89560' },
};

const STATUS_TABS = [
  { id: 'pending',  label: 'Pending',  icon: Clock,        color: '#F59E0B' },
  { id: 'approved', label: 'Approved', icon: CheckCircle2, color: '#10B981' },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle,  color: '#EF4444' },
  { id: 'all',      label: 'All',      icon: Sprout,       color: '#7F77DD' },
];

// ── Component ────────────────────────────────────────────────────
export default function AdminGrowPosts() {
  const dispatch = useDispatch();
  const {
    adminPosts, adminStatus, adminError, moderationStatus, message,
  } = useSelector((s) => s.grow);

  const [activeStatus, setActiveStatus] = useState('pending');
  const [query,        setQuery]        = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [preview,      setPreview]      = useState(null);      // post currently previewed
  const [rejectingId,  setRejectingId]  = useState(null);      // post pending reject dialog
  const [rejectReason, setRejectReason] = useState('');
  const [actingId,     setActingId]     = useState(null);      // id being moderated

  // ── Load posts on mount & when filter changes ──────────────────
  useEffect(() => {
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    dispatch(fetchAdminGrowPosts(params));
  }, [dispatch, activeStatus]);

  // ── Toast feedback ─────────────────────────────────────────────
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearGrowMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (adminError) {
      toast.error(adminError);
      dispatch(clearGrowError());
    }
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
  // Each handler tries the real API; if it fails (no backend yet),
  // falls back to a local mutation so the dummy data updates visually.
  const handleApprove = async (post) => {
    setActingId(post.id);
    const res = await dispatch(approveGrowPost(post.id));
    if (res.meta.requestStatus === 'rejected') {
      dispatch(locallySetGrowStatus({ id: post.id, status: 'approved' }));
      toast.success('Post approved.');
    }
  };

  const openReject = (post) => {
    setRejectingId(post.id);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    const id = rejectingId;
    const reason = rejectReason.trim() || null;
    setActingId(id);
    setRejectingId(null);
    setRejectReason('');

    const res = await dispatch(rejectGrowPost({ id, reason }));
    if (res.meta.requestStatus === 'rejected') {
      dispatch(locallySetGrowStatus({ id, status: 'rejected', reason }));
      toast.success('Post rejected.');
    }
  };

  const handleBoost = async (post) => {
    const res = await dispatch(boostGrowPost({ id: post.id, is_featured: !post.is_featured }));
    if (res.meta.requestStatus === 'rejected') {
      dispatch(locallyToggleGrowFeatured(post.id));
      toast.success(post.is_featured ? 'Removed feature.' : 'Post featured.');
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setActingId(post.id);
    const res = await dispatch(adminDeleteGrowPost(post.id));
    if (res.meta.requestStatus === 'rejected') {
      dispatch(locallyDeleteGrow(post.id));
      toast.success('Post deleted.');
    }
  };

  const isLoading = adminStatus === STATUS.LOADING;

  // ── Render ─────────────────────────────────────────────────────
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

        {/* Stats */}
        <div className="flex gap-3">
          {STATUS_TABS.slice(0, 3).map((s) => (
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
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => {
          const Icon = s.icon;
          const active = activeStatus === s.id;
          return (
            <button key={s.id}
              onClick={() => setActiveStatus(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
                ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={active ? { backgroundColor: s.color } : {}}>
              <Icon size={13} /> {s.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                {counts[s.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + type filter ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, location, author..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>

        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#9A9A94]" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2">
            <option value="all">All types</option>
            <option value="training">Training</option>
            <option value="retreat">Retreat</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={26} className="animate-spin text-[#7F77DD]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Sprout size={36} className="mx-auto text-[#C4BCB4] mb-3" />
            <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">Nothing to moderate</p>
            <p className="text-[#9A9A94] text-xs mt-1">
              No posts match the current filters.
            </p>
          </div>
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
                {filtered.map((post) => {
                  const typeMeta = TYPE_META[post.type] || TYPE_META.event;
                  const TypeIcon = typeMeta.icon;
                  const postedBy = post.posted_by || post.postedBy || post.user?.name || '—';
                  const isActing = actingId === post.id && moderationStatus === STATUS.LOADING;

                  return (
                    <tr key={post.id} className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3 max-w-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] line-clamp-1">
                              {post.title}
                            </p>
                            {post.location && (
                              <p className="flex items-center gap-1 text-[11px] text-[#6B6B66] mt-0.5">
                                <MapPin size={10} /> {post.location}
                              </p>
                            )}
                            {post.is_featured && (
                              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                                ⚡ FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
                          style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}>
                          <TypeIcon size={10} /> {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-semibold text-[#3E3D38]">{postedBy}</p>
                        {post.user?.email && (
                          <p className="text-[10px] text-[#9A9A94]">{post.user.email}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={post.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconBtn title="Preview" onClick={() => setPreview(post)}>
                            <Eye size={13} />
                          </IconBtn>

                          {post.status !== 'approved' && (
                            <IconBtn
                              title="Approve"
                              onClick={() => handleApprove(post)}
                              disabled={isActing}
                              color="green">
                              {isActing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            </IconBtn>
                          )}

                          {post.status !== 'rejected' && (
                            <IconBtn
                              title="Reject"
                              onClick={() => openReject(post)}
                              disabled={isActing}
                              color="red">
                              <AlertCircle size={13} />
                            </IconBtn>
                          )}

                          <IconBtn
                            title={post.is_featured ? 'Remove feature' : 'Feature post'}
                            onClick={() => handleBoost(post)}
                            color={post.is_featured ? 'yellow-active' : 'yellow'}>
                            <Star size={13} fill={post.is_featured ? 'currentColor' : 'none'} />
                          </IconBtn>

                          <IconBtn
                            title="Delete"
                            onClick={() => handleDelete(post)}
                            disabled={isActing}
                            color="red">
                            <Trash2 size={13} />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview Drawer ───────────────────────────────────── */}
      {preview && (
        <PreviewModal post={preview} onClose={() => setPreview(null)} />
      )}

      {/* ── Reject Dialog ────────────────────────────────────── */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E5E0D8]">
              <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Reject Post</h2>
              <p className="text-[11px] text-[#9A9A94] mt-0.5">
                Give the author a quick reason — this helps them resubmit correctly.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Optional reason (e.g. missing pricing, unclear location)..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#7F77DD] resize-none" />
            </div>
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex justify-end gap-3">
              <button onClick={() => setRejectingId(null)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#6B6B66] hover:bg-[#F5F0E8] transition-colors">
                Cancel
              </button>
              <button onClick={confirmReject}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#EF4444] hover:bg-[#d63b3b] transition-colors">
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function IconBtn({ children, title, onClick, disabled, color = 'default' }) {
  const colorCls = {
    default:        'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]',
    green:          'border-[#E5E0D8] text-[#10B981] hover:bg-[#10B981]/5 hover:border-[#10B981]',
    red:            'border-[#E5E0D8] text-[#EF4444] hover:bg-[#EF4444]/5 hover:border-[#EF4444]',
    yellow:         'border-[#E5E0D8] text-[#F59E0B] hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]',
    'yellow-active':'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10',
  }[color];

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorCls}`}>
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const cfg = {
    pending:  { label: 'Pending',  icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    approved: { label: 'Approved', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
    rejected: { label: 'Rejected', icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200'          },
  }[status] || { label: status || 'Unknown', icon: Clock, cls: 'bg-gray-50 text-gray-700 border-gray-200' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function PreviewModal({ post, onClose }) {
  const typeMeta = TYPE_META[post.type] || TYPE_META.event;
  const TypeIcon = typeMeta.icon;
  const postedBy = post.posted_by || post.postedBy || post.user?.name || '—';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="h-1 w-full rounded-t-2xl" style={{ backgroundColor: post.color || typeMeta.color }} />
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: typeMeta.color + '20', color: typeMeta.color }}>
              <TypeIcon size={10} /> {typeMeta.label}
            </span>
            <StatusPill status={post.status} />
            {post.is_featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                ⚡ FEATURED
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#FBF8E4] rounded-lg text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h2 className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">{post.title}</h2>
            {post.subtitle && <p className="text-[#6B6B66] text-sm mt-1">{post.subtitle}</p>}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-[#6B6B66]">
            {post.location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {post.location}</span>
            )}
            {(post.date_from || post.dates) && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {post.dates || `${post.date_from} – ${post.date_to || ''}`}
              </span>
            )}
            {(post.spots_left ?? post.spotsLeft) !== undefined && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {post.spots_left ?? post.spotsLeft} spots
              </span>
            )}
          </div>

          <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
            {post.description}
          </p>

          {(post.disciplines || []).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">Disciplines</p>
              <div className="flex flex-wrap gap-1.5">
                {post.disciplines.map((d) => (
                  <span key={d} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(post.tags || []).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F0EBE3] text-xs">
            <div>
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Posted by</p>
              <p className="font-semibold text-[#3E3D38]">{postedBy}</p>
            </div>
            {post.price && (
              <div>
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Price</p>
                <p className="font-semibold text-[#3E3D38]">{post.price}</p>
              </div>
            )}
            {(post.external_url || post.url) && (post.external_url || post.url) !== '#' && (
              <div className="col-span-2">
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">External link</p>
                <a href={post.external_url || post.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#7F77DD] font-semibold hover:underline">
                  {post.external_url || post.url} <ExternalLink size={11} />
                </a>
              </div>
            )}
            {post.rejection_reason && (
              <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-[10px] text-red-600 uppercase tracking-wide font-bold">Rejection Reason</p>
                <p className="text-xs text-red-700 mt-0.5">{post.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
