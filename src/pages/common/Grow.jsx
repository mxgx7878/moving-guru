import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Calendar, MapPin, Users, ExternalLink,
  Search, X, Filter, Edit3, Trash2, Plus, Loader2,
} from 'lucide-react';
import {
  fetchGrowPosts,
  fetchMyGrowPosts,
  deleteGrowPost,
} from '../../store/actions/grow';
import { clearGrowMessage, clearGrowError } from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';
import {
  GROW_FILTER_TABS as GROW_TYPES,
  GROW_TYPE_META,
  GROW_TYPE_BG as TYPE_BG,
  GROW_STATUS_PUBLIC_CONFIG as STATUS_BADGE,
} from '../../constants/growConstants';

// Icon lookup keyed by post type, derived from the centralised meta.
const TYPE_ICONS = Object.fromEntries(
  Object.entries(GROW_TYPE_META).map(([id, meta]) => [id, meta.icon]),
);

// ── Component ────────────────────────────────────────────────────
export default function Grow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { posts, myPosts, status, message, error } = useSelector((s) => s.grow);

  const role     = user?.role || 'instructor';
  const theme    = ROLE_THEME[role] || ROLE_THEME.instructor;
  const isStudio = role === 'studio';
  const isAdmin  = role === 'admin';
  const basePath = isStudio ? '/studio/grow'
                 : isAdmin  ? '/admin/grow'
                 : '/portal/grow';

  // UI state
  const [activeType,  setActiveType]  = useState('all');
  const [query,       setQuery]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDisc,  setFilterDisc]  = useState('');

  // ── Data load ─────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchGrowPosts());
    if (isStudio || role === 'instructor') {
      dispatch(fetchMyGrowPosts());
    }
  }, [dispatch, isStudio, role]);

  // ── Toast feedback ────────────────────────────────────────────
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearGrowMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearGrowError());
    }
  }, [error, dispatch]);

  // ── Studios view manages only their posts; others browse feed ─
  const sourcePosts = isStudio ? myPosts : posts;

  const allDisc = useMemo(() => (
    [...new Set(sourcePosts.flatMap((p) => p.disciplines || []))].filter(Boolean).sort()
  ), [sourcePosts]);

  const filtered = useMemo(() => (
    sourcePosts.filter((p) => {
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
    })
  ), [sourcePosts, activeType, query, filterDisc]);

  const clearFilters = () => { setQuery(''); setFilterDisc(''); };
  const hasFilters   = query || filterDisc;

  const handleDelete = (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    dispatch(deleteGrowPost(post.id));
  };

  const goNew  = () => navigate(`${basePath}/new`);
  const goEdit = (post) => navigate(`${basePath}/edit/${post.id}`);

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
          {(isStudio || role === 'instructor') && (
            <button
              onClick={goNew}
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
          const count  = sourcePosts.filter((p) => p.type === t.id).length;
          const active = activeType === t.id;
          return (
            <button key={t.id}
              onClick={() => setActiveType(active ? 'all' : t.id)}
              className={`rounded-2xl p-4 border text-center transition-all
                ${active ? 'border-2 shadow-sm' : 'bg-white border-[#E5E0D8] hover:shadow-sm'}`}
              style={active ? { borderColor: t.color, backgroundColor: t.color + '18' } : {}}>
              <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{count}</p>
              <p className="text-xs font-semibold mt-1"
                style={{ color: active ? t.color : '#9A9A94' }}>
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

                <div className="h-1 w-full" style={{ backgroundColor: post.color || typeCfg?.color || '#2DA4D6' }} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BG[post.type]}`}>
                          <TypeIcon size={9} /> {(post.type || '').toUpperCase()}
                        </span>
                        {post.is_featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                            ⚡ FEATURED
                          </span>
                        )}
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

                  <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
                    {post.description}
                  </p>

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

                  {/* Footer: owner + actions */}
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
                      {(isOwn || isAdmin) && (
                        <>
                          <button
                            onClick={() => goEdit(post)}
                            className="p-2 rounded-xl border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38] transition-colors"
                            aria-label="Edit post">
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 rounded-xl border border-[#E5E0D8] text-[#CE4F56] hover:bg-[#CE4F56]/5 hover:border-[#CE4F56] transition-colors"
                            aria-label="Delete post">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}

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
            onClick={goNew}
            className="bg-[#f5fca6] text-[#3E3D38] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-white transition-colors flex-shrink-0 whitespace-nowrap">
            Post Now
          </button>
        </div>
      )}
    </div>
  );
}
