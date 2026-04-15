import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  BookOpen, Palmtree, Calendar, MapPin, Users, ExternalLink,
  Search, X, Filter, Edit3, Trash2, Plus, Loader2, CheckCircle2,
  Clock, AlertCircle,
} from 'lucide-react';
import {
  fetchGrowPosts,
  fetchMyGrowPosts,
  createGrowPost,
  updateGrowPost,
  deleteGrowPost,
} from '../../store/actions/grow';
import { clearGrowMessage, clearGrowError, resetSubmitStatus } from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';

// ── Constants ────────────────────────────────────────────────────

const GROW_TYPES = [
  { id: 'all',      label: 'All Posts',        color: '#3E3D38' },
  { id: 'training', label: 'Teacher Training', color: '#2DA4D6' },
  { id: 'retreat',  label: 'Retreats',         color: '#6BE6A4' },
  { id: 'event',    label: 'Events',           color: '#E89560' },
];

const TYPE_ICONS = {
  training: BookOpen,
  retreat:  Palmtree,
  event:    Calendar,
};

const TYPE_BG = {
  training: 'bg-[#2DA4D6]/10 text-[#2DA4D6]',
  retreat:  'bg-[#6BE6A4]/30 text-[#3E3D38]',
  event:    'bg-[#E89560]/15 text-[#E89560]',
};

const STATUS_BADGE = {
  pending:  { label: 'Pending Approval', icon: Clock,        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Live',             icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'  },
  rejected: { label: 'Rejected',         icon: AlertCircle,  cls: 'bg-red-50 text-red-700 border-red-200'        },
};

const DISCIPLINE_LIST = [
  'Reformer Pilates','Mat Pilates','Vinyasa Yoga','Hatha Yoga','Yin Yoga',
  'Ashtanga Yoga','Barre','Breathwork / Pranayama','Meditation','Sound Bath / Sound Healing',
  'Massage','Muay Thai','Boxing','Kickboxing','Contemporary Dance',
  'Dance Movement Therapy','Somatic Movement','Tai Chi','Qigong',
];

// ── Main Component ───────────────────────────────────────────────

export default function Grow() {
  const dispatch   = useDispatch();
  const { user }   = useSelector((s) => s.auth);
  const { posts, myPosts, status, submitStatus, message, submitError } =
    useSelector((s) => s.grow);

  const role      = user?.role || 'instructor';
  const theme     = ROLE_THEME[role] || ROLE_THEME.instructor;
  const isStudio  = role === 'studio';
  const isAdmin   = role === 'admin';

  // UI state
  const [activeType,   setActiveType]   = useState('all');
  const [query,        setQuery]        = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [filterDisc,   setFilterDisc]   = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost,  setEditingPost]  = useState(null);   // post object to edit

  // ── Load data on mount ────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchGrowPosts());
    if (isStudio || role === 'instructor') {
      dispatch(fetchMyGrowPosts());
    }
  }, [dispatch, isStudio, role]);

  // ── Toast on message / error ──────────────────────────────────
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearGrowMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
      dispatch(clearGrowError());
    }
  }, [submitError, dispatch]);

  // ── After successful submit, close form ───────────────────────
  useEffect(() => {
    if (submitStatus === STATUS.SUCCEEDED) {
      setShowPostForm(false);
      setEditingPost(null);
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, dispatch]);

  // ── Decide which posts list to show per role ──────────────────
  // Studios see ONLY their own posts (manage view)
  // Instructors + admin see full public feed
  const sourcePosts = isStudio ? myPosts : posts;

  const allDisc = useMemo(() => (
    [...new Set(sourcePosts.flatMap((p) => p.disciplines || []))].filter(Boolean).sort()
  ), [sourcePosts]);

  const filtered = useMemo(() => {
    return sourcePosts.filter((p) => {
      const matchType = activeType === 'all' || p.type === activeType;
      const q = query.toLowerCase();
      const matchQ = !q
        || (p.title       || '').toLowerCase().includes(q)
        || (p.description || '').toLowerCase().includes(q)
        || (p.location    || '').toLowerCase().includes(q)
        || (p.posted_by || p.postedBy || '').toLowerCase().includes(q);
      const matchD = !filterDisc
        || (p.disciplines || []).some((d) => d.toLowerCase().includes(filterDisc.toLowerCase()));
      return matchType && matchQ && matchD;
    });
  }, [sourcePosts, activeType, query, filterDisc]);

  const clearFilters = () => { setQuery(''); setFilterDisc(''); };
  const hasFilters   = query || filterDisc;

  const handleDelete = (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    dispatch(deleteGrowPost(post.id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f5fca6 0%, #6BE6A4 60%, #2DA4D6 100%)' }}>
        <div className="relative z-10">
          <p className="text-[#3E3D38]/60 text-xs font-semibold tracking-widest uppercase mb-2">Grow</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
            {isStudio ? 'Your Posted Retreats & Events' : 'Training, Retreats & Events'}
          </h1>
          <p className="text-[#3E3D38]/70 text-sm max-w-lg">
            {isStudio
              ? 'Manage the trainings, retreats and events your studio has posted.'
              : 'Upskill, deepen your practice, and connect with the global wellness community.'}
          </p>
          {/* Post button in hero for studios */}
          {(isStudio || role === 'instructor') && (
            <button
              onClick={() => { setEditingPost(null); setShowPostForm(true); }}
              className="mt-4 flex items-center gap-2 bg-[#3E3D38] text-[#f5fca6] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-black transition-colors">
              <Plus size={14} /> Post an Opportunity
            </button>
          )}
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {GROW_TYPES.filter((t) => t.id !== 'all').map((t) => {
          const count = sourcePosts.filter((p) => p.type === t.id).length;
          return (
            <button key={t.id}
              onClick={() => setActiveType(t.id === activeType ? 'all' : t.id)}
              className={`rounded-2xl p-4 border text-center transition-all
                ${activeType === t.id ? 'border-2 shadow-sm' : 'bg-white border-[#E5E0D8] hover:shadow-sm'}`}
              style={activeType === t.id ? { borderColor: t.color, backgroundColor: t.color + '18' } : {}}>
              <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{count}</p>
              <p className="text-xs font-semibold mt-1"
                style={{ color: activeType === t.id ? t.color : '#9A9A94' }}>
                {t.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Search + Filters ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search training, retreats, events..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${showFilters ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66]'}`}
            style={showFilters ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}>
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap gap-2">
          {GROW_TYPES.map((t) => (
            <button key={t.id} onClick={() => setActiveType(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${activeType === t.id ? 'text-white border-transparent' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={activeType === t.id ? { backgroundColor: t.color } : {}}>
              {t.label}
              {t.id !== 'all' && ` (${sourcePosts.filter((p) => p.type === t.id).length})`}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="pt-2 border-t border-[#E5E0D8]">
            <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">
              Filter by Discipline
            </label>
            <div className="flex flex-wrap gap-2">
              {allDisc.map((d) => (
                <button key={d} onClick={() => setFilterDisc(filterDisc === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${filterDisc === d
                      ? 'text-white border-transparent'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={filterDisc === d ? { backgroundColor: theme.accent } : {}}>
                  {d}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-2 text-xs text-[#9A9A94] hover:text-[#3E3D38] flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Loading state ──────────────────────────────────────── */}
      {status === STATUS.LOADING && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#2DA4D6]" />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {status !== STATUS.LOADING && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <BookOpen size={36} className="mx-auto text-[#C4BCB4] mb-3" />
          <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">
            {isStudio ? "You haven't posted anything yet" : 'No results found'}
          </p>
          <p className="text-[#9A9A94] text-xs mt-1">
            {isStudio ? 'Click "Post an Opportunity" above to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* ── Cards Grid ─────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((post) => {
            const TypeIcon  = TYPE_ICONS[post.type] || Calendar;
            const typeCfg   = GROW_TYPES.find((t) => t.id === post.type);
            const postedBy  = post.posted_by || post.postedBy || post.user?.name || '—';
            const isOwn     = post.user_id === user?.id || post.user?.id === user?.id;
            const statusCfg = STATUS_BADGE[post.status] || null;

            return (
              <div key={post.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow flex flex-col">

                {/* Card top accent strip */}
                <div className="h-1 w-full" style={{ backgroundColor: post.color || typeCfg?.color || '#2DA4D6' }} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BG[post.type]}`}>
                          <TypeIcon size={9} /> {post.type.toUpperCase()}
                        </span>
                        {post.is_featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                            ⚡ FEATURED
                          </span>
                        )}
                        {/* Status badge — only shown to post owner or admin */}
                        {(isOwn || isAdmin) && statusCfg && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}>
                            <statusCfg.icon size={9} /> {statusCfg.label}
                          </span>
                        )}
                      </div>
                      <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                      {post.subtitle && (
                        <p className="text-[#9A9A94] text-xs mt-0.5">{post.subtitle}</p>
                      )}
                    </div>

                    {/* Thumbnail */}
                    {(post.images?.[0]) && (
                      <img src={post.images[0]} alt={post.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#E5E0D8]" />
                    )}
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.location && (
                      <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                        <MapPin size={11} className="text-[#9A9A94]" /> {post.location}
                      </span>
                    )}
                    {(post.date_from || post.dates) && (
                      <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                        <Calendar size={11} className="text-[#9A9A94]" />
                        {post.dates || `${post.date_from} – ${post.date_to || ''}`}
                      </span>
                    )}
                    {(post.spots_left ?? post.spotsLeft) !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
                        <Users size={11} className="text-[#9A9A94]" />
                        {post.spots_left ?? post.spotsLeft} spots left
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
                    {post.description}
                  </p>

                  {/* Tags */}
                  {(post.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(post.tags || []).map((tag) => (
                        <span key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: price + actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE3]">
                    <div>
                      <p className="text-[10px] text-[#9A9A94] uppercase tracking-wide">Posted by</p>
                      <p className="text-xs font-semibold text-[#3E3D38]">{postedBy}</p>
                      {post.price && (
                        <p className="text-xs font-bold mt-0.5" style={{ color: post.color || typeCfg?.color }}>
                          {post.price}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit / Delete — only owner or admin */}
                      {(isOwn || isAdmin) && (
                        <>
                          <button
                            onClick={() => { setEditingPost(post); setShowPostForm(true); }}
                            className="p-2 rounded-xl border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38] transition-colors">
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 rounded-xl border border-[#E5E0D8] text-[#CE4F56] hover:bg-[#CE4F56]/5 hover:border-[#CE4F56] transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}

                      {/* More Info link */}
                      {(post.external_url || post.url) && (post.external_url || post.url) !== '#' && (
                        <a href={post.external_url || post.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
                          style={{ backgroundColor: post.color || typeCfg?.color || '#3E3D38' }}>
                          More Info <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Post CTA (instructors browsing) ───────────────────── */}
      {!isStudio && role !== 'admin' && (
        <div className="bg-gradient-to-r from-[#3E3D38] to-[#6B6B66] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="font-['Unbounded'] text-sm font-bold text-white">Running a training or retreat?</p>
              <p className="text-white/60 text-xs mt-0.5">Post it here and reach thousands of wellness professionals globally</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingPost(null); setShowPostForm(true); }}
            className="bg-[#f5fca6] text-[#3E3D38] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-white transition-colors flex-shrink-0 whitespace-nowrap">
            Post Now
          </button>
        </div>
      )}

      {/* ── Post / Edit Form Modal ─────────────────────────────── */}
      {showPostForm && (
        <GrowPostModal
          post={editingPost}
          theme={theme}
          submitStatus={submitStatus}
          onClose={() => { setShowPostForm(false); setEditingPost(null); dispatch(resetSubmitStatus()); }}
          onSubmit={(payload) => {
            if (editingPost) {
              dispatch(updateGrowPost({ id: editingPost.id, ...payload }));
            } else {
              dispatch(createGrowPost(payload));
            }
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Post / Edit Modal
// ═══════════════════════════════════════════════════════════════

function GrowPostModal({ post, theme, submitStatus, onClose, onSubmit }) {
  const isEditing = !!post;

  const [form, setForm] = useState({
    type:         post?.type        || 'training',
    title:        post?.title       || '',
    subtitle:     post?.subtitle    || '',
    description:  post?.description || '',
    location:     post?.location    || '',
    date_from:    post?.date_from   || '',
    date_to:      post?.date_to     || '',
    price:        post?.price       || '',
    spots:        post?.spots       || '',
    spots_left:   post?.spots_left ?? post?.spotsLeft ?? '',
    external_url: post?.external_url || post?.url || '',
    disciplines:  post?.disciplines || [],
    tags_raw:     (post?.tags || []).join(', '),
    expiry_date:  '',
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDisc = (d) => {
    setForm((f) => ({
      ...f,
      disciplines: f.disciplines.includes(d)
        ? f.disciplines.filter((x) => x !== d)
        : [...f.disciplines, d],
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim())       return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.location.trim())    return toast.error('Location is required');

    onSubmit({
      type:         form.type,
      title:        form.title.trim(),
      subtitle:     form.subtitle.trim(),
      description:  form.description.trim(),
      location:     form.location.trim(),
      date_from:    form.date_from || null,
      date_to:      form.date_to   || null,
      price:        form.price.trim(),
      spots:        form.spots     ? Number(form.spots)     : null,
      spots_left:   form.spots_left ? Number(form.spots_left) : null,
      external_url: form.external_url.trim() || null,
      disciplines:  form.disciplines,
      tags:         form.tags_raw.split(',').map((t) => t.trim()).filter(Boolean),
      expiry_date:  form.expiry_date || null,
    });
  };

  const isLoading = submitStatus === STATUS.LOADING;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
              {isEditing ? 'Edit Post' : 'Post an Opportunity'}
            </h2>
            <p className="text-[10px] text-[#9A9A94] mt-0.5">
              {isEditing
                ? 'Update the details for your training, retreat or event.'
                : 'Fill in the details. Your post will go live after admin approval.'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
              Type *
            </label>
            <div className="flex gap-2">
              {GROW_TYPES.filter((t) => t.id !== 'all').map((t) => (
                <button key={t.id} type="button"
                  onClick={() => update('type', t.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${form.type === t.id ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66]'}`}
                  style={form.type === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Field label="Title *">
            <input value={form.title} onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Imagine Studios Thailand — Pilates Teacher Training"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {/* Subtitle */}
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)}
              placeholder="e.g. Internationally accredited 500h program"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {/* Description */}
          <Field label="Description *">
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              rows={4} placeholder="Tell people what this is about, what's included, who it's for..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] resize-none" />
          </Field>

          {/* Location */}
          <Field label="Location *">
            <input value={form.location} onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. Koh Samui, Thailand"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date From">
              <input type="date" value={form.date_from} onChange={(e) => update('date_from', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </Field>
            <Field label="Date To">
              <input type="date" value={form.date_to} onChange={(e) => update('date_to', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </Field>
          </div>

          {/* Price + Spots row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price">
              <input value={form.price} onChange={(e) => update('price', e.target.value)}
                placeholder="e.g. From $3,800 USD"
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </Field>
            <Field label="Total Spots">
              <input type="number" value={form.spots} onChange={(e) => update('spots', e.target.value)}
                placeholder="e.g. 12"
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </Field>
          </div>

          {/* Disciplines */}
          <Field label="Disciplines">
            <div className="flex flex-wrap gap-2 mt-1">
              {DISCIPLINE_LIST.map((d) => (
                <button key={d} type="button" onClick={() => toggleDisc(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${form.disciplines.includes(d)
                      ? 'text-white border-transparent'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={form.disciplines.includes(d) ? { backgroundColor: theme.accent } : {}}>
                  {d}
                </button>
              ))}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags (comma separated)">
            <input value={form.tags_raw} onChange={(e) => update('tags_raw', e.target.value)}
              placeholder="e.g. 500h, Accredited, Residential"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {/* External URL */}
          <Field label="Website / More Info URL">
            <input value={form.external_url} onChange={(e) => update('external_url', e.target.value)}
              placeholder="https://yourstudio.com/training"
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {/* Expiry */}
          <Field label="Auto-remove post after (expiry date)">
            <input type="date" value={form.expiry_date} onChange={(e) => update('expiry_date', e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </Field>

          {!isEditing && (
            <p className="text-[11px] text-[#9A9A94] bg-[#FDFCF8] rounded-xl p-3 border border-[#E5E0D8]">
              ℹ️ Your post will be reviewed by the Moving Guru team before it goes live. You'll be notified once approved.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-semibold text-[#6B6B66] hover:bg-[#F5F0E8] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: theme.accent }}>
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small helper component ────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}