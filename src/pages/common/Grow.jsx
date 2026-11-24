import usePageLoading from '../../hooks/usePageLoading';
import { CardSkeleton } from '../../components/feedback';
import PageHeader from '../../components/ui/PageHeader';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import {
  fetchGrowPosts, fetchMyGrowPosts, deleteGrowPost,
} from '../../store/actions/grow';
import { clearGrowMessage, clearGrowError } from '../../store/slices/growSlice';
import { ROLE_THEME } from '../../config/portalConfig';
import { STATUS } from '../../constants/apiConstants';
import {
  GROW_FILTER_TABS, GROW_TYPES,
} from '../../constants/growConstants';
import {
  Button, Toolbar, TabBar, Chip, EmptyState, StatTileGroup,
} from '../../components/ui';
import { GrowPostCard } from '../../features/growPosts';
import { ConfirmModal, BoostPaymentModal } from '../../features/modals';

export default function Grow() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { posts, myPosts, status, myPostsStatus, message, error } = useSelector((s) => s.grow);

  const role     = user?.role || 'instructor';
  const theme    = ROLE_THEME[role] || ROLE_THEME.instructor;
  const isStudio = role === 'studio';
  const isAdmin  = role === 'admin';
  const basePath = isStudio ? '/studio/grow' : isAdmin ? '/admin/grow' : '/portal/grow';

  const [activeType,    setActiveType]    = useState('all');
  const [query,         setQuery]         = useState('');
  const [showFilters,   setShowFilters]   = useState(false);
  const [filterDisc,    setFilterDisc]    = useState('');
  const [deletingPost,  setDeletingPost]  = useState(null);
  const [boostingPost,  setBoostingPost]  = useState(null);

  useEffect(() => {
    dispatch(fetchGrowPosts());
    if (!isAdmin) dispatch(fetchMyGrowPosts());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearGrowMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearGrowError()); }
  }, [error, dispatch]);

  const isMine      = activeType === 'my';
  const loading = usePageLoading(isMine ? myPostsStatus : status);
const sourcePosts = isMine
  ? myPosts
  : posts.filter((p) => (p.user_id ?? p.user?.id) !== user?.id);

  const allDisc = useMemo(() => (
    [...new Set(sourcePosts.flatMap((p) => p.disciplines || []))].filter(Boolean).sort()
  ), [sourcePosts]);

  const filtered = useMemo(() => (
    sourcePosts.filter((p) => {
      const matchType = isMine || activeType === 'all' || p.type === activeType;
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
  ), [sourcePosts, activeType, isMine, query, filterDisc]);

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

  const openBoost = (post) => setBoostingPost(post);

  const handleBoostPaid = async () => {
    if (!boostingPost) return;
    setBoostingPost(null);
    await Promise.all([
      dispatch(fetchGrowPosts()),
      dispatch(fetchMyGrowPosts()),
    ]);
  };

  const canPost = isStudio || role === 'instructor';

  const publicFeed = useMemo(
  () => posts.filter((p) => (p.user_id ?? p.user?.id) !== user?.id),
  [posts, user?.id],
);
  const statTiles = GROW_TYPES.map((t) => ({
    label:   t.label,
    value:  publicFeed.filter((p) => p.type === t.id).length,
    color: 'text-brand-ink',
    active:  activeType === t.id,
    onClick: () => setActiveType(activeType === t.id ? 'all' : t.id),
  }));

const typeCounts = GROW_FILTER_TABS.reduce((acc, t) => ({
  ...acc,
  [t.id]:
    t.id === 'my'  ? myPosts.length
  : t.id === 'all' ? publicFeed.length
  : publicFeed.filter((p) => p.type === t.id).length,
}), {});

  const heroTitle = isMine
    ? 'My Posts'
    : 'Training, Retreats & Events';
  const heroBlurb = isMine
    ? 'Manage your own posts — edit details for free or boost to pin to the top of the feed.'
    : 'Upskill, deepen your practice, and connect with the global wellness community.';

  return (
    <div className="-m-4 lg:-m-6 p-4 lg:p-6 min-h-full">
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader eyebrow="Grow" title={heroTitle} description={heroBlurb}
        actions={canPost && <Button variant="primary" size="sm" icon={Plus} onClick={goNew}>Post an Opportunity</Button>} />

      {!loading && !isMine && <StatTileGroup tiles={statTiles} columns={3} />}

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
              <label className="block text-ink-muted text-[10px] uppercase tracking-wider font-semibold mb-1.5">
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
        resultCount={!loading && hasFilters ? filtered.length : null}
        resultNoun="result"
        onClear={hasFilters ? clearFilters : null}
        hasActiveFilters={hasFilters}
      >
        <TabBar
          variant="pill"
          tabs={canPost ? GROW_FILTER_TABS : GROW_FILTER_TABS.filter((t) => t.id !== 'my')}
          activeId={activeType}
          onChange={setActiveType}
          counts={loading ? undefined : typeCounts}
        />
      </Toolbar>

      {loading && <CardSkeleton count={4} />}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={BookOpen}
            title={isMine ? "You haven't posted anything yet" : 'No results found'}
            message={isMine ? 'Click "Post an Opportunity" above to get started.' : 'Try adjusting your filters.'}
          />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((post) => {
            const isOwn = isMine
              || post.user_id === user?.id
              || post.user?.id === user?.id;
            return (
              <GrowPostCard
                key={post.id}
                post={post}
                showStatus={isOwn || isAdmin}
                ownerActions={isOwn || isAdmin}
                onEdit={goEdit}
                onDelete={setDeletingPost}
                onBoost={ isMine && !post.is_featured  ? openBoost : undefined}
              />
            );
          })}
        </div>
      )}

      {!isAdmin && canPost && !isMine && (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-[#B4FF5A]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-[#3F6216]" />
            </div>
            <div>
              <p className="font-unbounded text-sm font-bold text-[#1A1A1A]">Running a training or retreat?</p>
              <p className="text-[#6B6B66] text-xs mt-0.5">
                Post it here and reach thousands of wellness professionals globally.
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={goNew}
            className="flex-shrink-0"
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

      <BoostPaymentModal
        open={!!boostingPost}
        post={boostingPost}
        role={role}
        onCancel={() => setBoostingPost(null)}
        onPaid={handleBoostPaid}
      />
    </div>
    </div>
  );
}
