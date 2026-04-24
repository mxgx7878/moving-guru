import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import {
  fetchGrowPosts,
  fetchMyGrowPosts,
  deleteGrowPost,
} from '../../store/actions/grow';
import { clearGrowMessage, clearGrowError } from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';
import {
  GROW_FILTER_TABS,
  GROW_TYPES,
} from '../../constants/growConstants';
import {
  Button, Toolbar, TabBar, Chip, EmptyState, StatTileGroup,
} from '../../components/ui';
import { GrowPostCard } from '../../features/growPosts';
import { ConfirmModal } from '../../features/modals';

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

  const [activeType,   setActiveType]   = useState('all');
  const [query,        setQuery]        = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [filterDisc,   setFilterDisc]   = useState('');
  const [deletingPost, setDeletingPost] = useState(null);

  useEffect(() => {
    dispatch(fetchGrowPosts());
    if (isStudio || role === 'instructor') {
      dispatch(fetchMyGrowPosts());
    }
  }, [dispatch, isStudio, role]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearGrowMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error)   { toast.error(error);     dispatch(clearGrowError()); }
  }, [error, dispatch]);

  // Studios manage only their own posts; instructors/admins browse the feed.
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

  const hasFilters   = !!(query || filterDisc);
  const clearFilters = () => { setQuery(''); setFilterDisc(''); };

  const confirmDelete = async () => {
    if (!deletingPost) return;
    const id = deletingPost.id;
    setDeletingPost(null);
    await dispatch(deleteGrowPost(id));
  };

  const goNew  = () => navigate(`${basePath}/new`);
  const goEdit = (post) => navigate(`${basePath}/edit/${post.id}`);

  const canPost = isStudio || role === 'instructor';

  // Interactive KPI strip — click a tile to toggle that type as the filter.
  const statTiles = GROW_TYPES.map((t) => ({
    label:   t.label,
    value:   sourcePosts.filter((p) => p.type === t.id).length,
    color:   `text-[${t.color}]`,
    active:  activeType === t.id,
    onClick: () => setActiveType(activeType === t.id ? 'all' : t.id),
  }));

  const typeCounts = GROW_FILTER_TABS.reduce((acc, t) => ({
    ...acc,
    [t.id]: t.id === 'all' ? sourcePosts.length : sourcePosts.filter((p) => p.type === t.id).length,
  }), {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Hero — gradient card is page-specific (not reused) */}
      <div className="rounded-2xl p-6 border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f5fca6 0%, #6BE6A4 60%, #2DA4D6 100%)' }}>
        <div className="relative z-10">
          <p className="text-[#3E3D38]/60 text-xs font-semibold tracking-widest uppercase mb-2">Grow</p>
          <h1 className="font-unbounded text-2xl font-black text-[#3E3D38] mb-1">
            {isStudio ? 'Your Posted Retreats & Events' : 'Training, Retreats & Events'}
          </h1>
          <p className="text-[#3E3D38]/70 text-sm max-w-lg">
            {isStudio
              ? 'Manage the trainings, retreats and events your studio has posted.'
              : 'Upskill, deepen your practice, and connect with the global wellness community.'}
          </p>
          {canPost && (
            <Button variant="accent" size="sm" icon={Plus} onClick={goNew} className="mt-4">
              Post an Opportunity
            </Button>
          )}
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      </div>

      <StatTileGroup tiles={statTiles} columns={3} />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search training, retreats, events...',
        }}
        advanced={{
          open: showFilters,
          onToggle: () => setShowFilters((v) => !v),
          hasActive: !!filterDisc,
          accent: theme.accent,
          toggleLabel: 'Filter',
          children: (
            <div>
              <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                Filter by Discipline
              </label>
              <div className="flex flex-wrap gap-2">
                {allDisc.map((d) => (
                  <Chip
                    key={d}
                    size="sm"
                    tone={filterDisc === d ? 'blue' : 'neutral'}
                    onClick={() => setFilterDisc(filterDisc === d ? '' : d)}
                  >
                    {d}
                  </Chip>
                ))}
              </div>
            </div>
          ),
        }}
        resultCount={hasFilters ? filtered.length : null}
        resultNoun="result"
        onClear={hasFilters ? clearFilters : null}
        hasActiveFilters={hasFilters}
      >
        <TabBar
          variant="pill"
          tabs={GROW_FILTER_TABS}
          activeId={activeType}
          onChange={setActiveType}
          counts={typeCounts}
        />
      </Toolbar>

      {status === STATUS.LOADING && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#2DA4D6]" />
        </div>
      )}

      {status !== STATUS.LOADING && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={BookOpen}
            title={isStudio ? "You haven't posted anything yet" : 'No results found'}
            message={isStudio ? 'Click "Post an Opportunity" above to get started.' : 'Try adjusting your filters.'}
          />
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((post) => {
            const isOwn = post.user_id === user?.id || post.user?.id === user?.id;
            return (
              <GrowPostCard
                key={post.id}
                post={post}
                showStatus={isOwn || isAdmin}
                ownerActions={isOwn || isAdmin}
                onEdit={goEdit}
                onDelete={setDeletingPost}
              />
            );
          })}
        </div>
      )}

      {!isStudio && role !== 'admin' && (
        <div className="bg-gradient-to-r from-[#3E3D38] to-[#6B6B66] rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="font-unbounded text-sm font-bold text-white">Running a training or retreat?</p>
              <p className="text-white/60 text-xs mt-0.5">
                Post it here and reach thousands of wellness professionals globally
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={goNew}
            className="bg-[#f5fca6] !text-[#3E3D38] border-[#f5fca6] hover:bg-white"
          >
            Post Now
          </Button>
        </div>
      )}

      {deletingPost && (
        <ConfirmModal
          title="Delete post?"
          message={`Permanently delete "${deletingPost.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeletingPost(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
