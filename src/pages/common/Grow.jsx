import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  BookOpen, Palmtree, Calendar, MapPin, Users, ExternalLink,
  Search, X, Filter, Tag, Edit3, Check
} from 'lucide-react';
import { GROW_POSTS, GROW_TYPES } from '../../data/growData';
import { ROLE_THEME } from '../../config/portalConfig';

const TYPE_ICONS = {
  training: BookOpen,
  retreat:  Palmtree,
  event:    Calendar,
};

const TYPE_LABELS = {
  training: 'Teacher Training',
  retreat:  'Retreat',
  event:    'Event',
};

const TYPE_BG = {
  training: 'bg-[#2DA4D6]/10 text-[#2DA4D6]',
  retreat:  'bg-[#6BE6A4]/20 text-[#3E3D38]',
  event:    'bg-[#E89560]/15 text-[#E89560]',
};

export default function Grow() {
  const { user }  = useSelector((s) => s.auth);
  const role      = user?.role || 'instructor';
  const theme     = ROLE_THEME[role] || ROLE_THEME.instructor;
  const studioName = user?.studio_name || user?.studioName || user?.name || '';

  // ── Posts are kept in local state so studio owners can edit their own.
  //    This shows the live data from GROW_POSTS but lets us mutate locally
  //    until the API is wired up.
  const [posts, setPosts] = useState(GROW_POSTS);

  const [activeType,  setActiveType]  = useState('all');
  const [query,       setQuery]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDisc,  setFilterDisc]  = useState('');

  // Edit modal state
  const [editingPost, setEditingPost] = useState(null);

  // A studio "owns" a post when the postedBy name matches their studio name.
  const isOwnPost = (post) =>
    role === 'studio' && studioName &&
    post.postedBy?.toLowerCase().trim() === studioName.toLowerCase().trim();

  const handleSavePost = (updated) => {
    setPosts(ps => ps.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    setEditingPost(null);
  };

  const allDisc = useMemo(() => (
    [...new Set(posts.flatMap(p => p.disciplines))].filter(Boolean).sort()
  ), [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchType = activeType === 'all' || p.type === activeType;
      const q = query.toLowerCase();
      const matchQ = !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.postedBy.toLowerCase().includes(q);
      const matchD = !filterDisc || (p.disciplines || []).some(d => d.toLowerCase().includes(filterDisc.toLowerCase()));
      return matchType && matchQ && matchD;
    });
  }, [posts, activeType, query, filterDisc]);

  const clearFilters = () => { setQuery(''); setFilterDisc(''); };
  const hasFilters   = query || filterDisc;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-6 border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f5fca6 0%, #6BE6A4 60%, #2DA4D6 100%)' }}>
        <div className="relative z-10">
          <p className="text-[#3E3D38]/60 text-xs font-semibold tracking-widest uppercase mb-2">Grow</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
            Training, Retreats & Events
          </h1>
          <p className="text-[#3E3D38]/70 text-sm max-w-lg">
            Upskill, deepen your practice, and connect with the global wellness community.
            Opportunities from studios and educators worldwide.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {GROW_TYPES.filter(t => t.id !== 'all').map(t => {
          const count = GROW_POSTS.filter(p => p.type === t.id).length;
          return (
            <button key={t.id} onClick={() => setActiveType(t.id === activeType ? 'all' : t.id)}
              className={`rounded-2xl p-4 border text-center transition-all
                ${activeType === t.id ? 'border-2 shadow-sm' : 'bg-white border-[#E5E0D8] hover:shadow-sm'}`}
              style={activeType === t.id ? { borderColor: t.color, backgroundColor: t.color + '10' } : {}}>
              <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{count}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: activeType === t.id ? t.color : '#9A9A94' }}>
                {t.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5">
            <Search size={16} className="text-[#9A9A94]" />
            <input value={query} onChange={e => setQuery(e.target.value)}
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
          {GROW_TYPES.map(t => (
            <button key={t.id} onClick={() => setActiveType(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${activeType === t.id ? 'text-white border-transparent' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={activeType === t.id ? { backgroundColor: t.color } : {}}>
              {t.label}
              {t.id !== 'all' && ` (${GROW_POSTS.filter(p => p.type === t.id).length})`}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="pt-2 border-t border-[#E5E0D8]">
            <label className="block text-[#9A9A94] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Filter by Discipline</label>
            <div className="flex flex-wrap gap-2">
              {allDisc.map(d => (
                <button key={d} onClick={() => setFilterDisc(filterDisc === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${filterDisc === d ? 'text-white border-transparent' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                  style={filterDisc === d ? { backgroundColor: theme.accent } : {}}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {(hasFilters || activeType !== 'all') && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
            <p className="text-[#9A9A94] text-xs">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
            <button onClick={() => { clearFilters(); setActiveType('all'); }}
              className="text-xs text-[#CE4F56] hover:underline flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <BookOpen size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">No results found</p>
          <button onClick={() => { clearFilters(); setActiveType('all'); }}
            className="mt-3 text-sm text-[#CE4F56] hover:underline">Clear filters</button>
        </div>
      )}

      {/* Posts grid */}
      {filtered.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(post => {
            const TypeIcon = TYPE_ICONS[post.type] || BookOpen;
            const spotsPercent = Math.round(((post.spots - post.spotsLeft) / post.spots) * 100);
            const almostFull   = post.spotsLeft <= 3;

            return (
              <div key={post.id}
                className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-all group">

                {/* Colour banner */}
                <div className="h-3 w-full" style={{ backgroundColor: post.color }} />

                <div className="p-5">
                  {/* Type + title */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: post.color + '20' }}>
                        <TypeIcon size={15} style={{ color: post.color === '#f5fca6' ? '#3E3D38' : post.color }} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BG[post.type]}`}>
                        {TYPE_LABELS[post.type]}
                      </span>
                    </div>
                    {almostFull && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex-shrink-0">
                        Almost Full!
                      </span>
                    )}
                  </div>

                  <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] leading-snug mb-1">
                    {post.title}
                  </h3>
                  <p className="text-[#9A9A94] text-xs mb-3">{post.subtitle}</p>

                  {/* Details */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                      <MapPin size={11} className="text-[#9A9A94] flex-shrink-0" />
                      {post.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                      <Calendar size={11} className="text-[#9A9A94] flex-shrink-0" />
                      {post.dates}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                      <Users size={11} className="text-[#9A9A94] flex-shrink-0" />
                      {post.spotsLeft} of {post.spots} spots remaining
                    </div>
                  </div>

                  {/* Spots progress bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-[#FBF8E4] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${spotsPercent}%`,
                          backgroundColor: almostFull ? '#CE4F56' : post.color,
                        }} />
                    </div>
                    <p className="text-[10px] text-[#9A9A94] mt-1">{spotsPercent}% full</p>
                  </div>

                  {/* Description */}
                  <p className="text-[#6B6B66] text-xs leading-relaxed line-clamp-3 mb-3">
                    {post.description}
                  </p>

                  {/* Disciplines */}
                  {post.disciplines.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.disciplines.slice(0, 4).map(d => (
                        <span key={d} className="px-2 py-0.5 bg-[#FBF8E4] text-[#6B6B66] text-[10px] rounded-full">{d}</span>
                      ))}
                      {post.disciplines.length > 4 && (
                        <span className="px-2 py-0.5 bg-[#FBF8E4] text-[#9A9A94] text-[10px] rounded-full">+{post.disciplines.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#9A9A94]">
                          <Tag size={8} /> {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D8]">
                    <div>
                      <p className="text-[10px] text-[#9A9A94]">Posted by</p>
                      <p className="text-xs font-semibold text-[#3E3D38]">{post.postedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#3E3D38]">{post.price}</p>
                      {isOwnPost(post) && (
                        <button
                          onClick={() => setEditingPost(post)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#3E3D38] hover:border-[#3E3D38] transition-all"
                          title="Edit this post"
                        >
                          <Edit3 size={11} /> Edit Info
                        </button>
                      )}
                      <a href={post.url}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: post.color === '#f5fca6' ? '#3E3D38' : post.color }}>
                        More Info <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post your own CTA */}
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
        <button className="bg-[#f5fca6] text-[#3E3D38] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-white transition-colors flex-shrink-0 whitespace-nowrap">
          Post Now
        </button>
      </div>

      {/* Edit modal — owners only */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Edit modal — lets a studio owner update their Grow post.
   ──────────────────────────────────────────────────────────── */
function EditPostModal({ post, onClose, onSave }) {
  const [form, setForm] = useState({
    title:        post.title || '',
    subtitle:     post.subtitle || '',
    description:  post.description || '',
    location:     post.location || '',
    dates:        post.dates || '',
    price:        post.price || '',
    spots:        post.spots || 0,
    spotsLeft:    post.spotsLeft || 0,
    url:          post.url || '',
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    onSave({ ...post, ...form, spots: Number(form.spots), spotsLeft: Number(form.spotsLeft) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">Edit Post</h2>
            <p className="text-[10px] text-[#9A9A94] mt-0.5">Update the details for your training, retreat or event</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Title</label>
            <input value={form.title} onChange={e => update('title', e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Subtitle</label>
            <input value={form.subtitle} onChange={e => update('subtitle', e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={5}
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Location</label>
              <input value={form.location} onChange={e => update('location', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Dates</label>
              <input value={form.dates} onChange={e => update('dates', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Total Spots</label>
              <input type="number" min="0" value={form.spots} onChange={e => update('spots', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Spots Remaining</label>
              <input type="number" min="0" value={form.spotsLeft} onChange={e => update('spotsLeft', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Price</label>
              <input value={form.price} onChange={e => update('price', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">More Info Link</label>
              <input value={form.url} onChange={e => update('url', e.target.value)} placeholder="https://..."
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6]" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-between">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94]">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3E3D38] text-white rounded-xl text-sm font-bold hover:bg-[#2a2925]">
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}