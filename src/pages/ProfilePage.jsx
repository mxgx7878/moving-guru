import { useState, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {clearError, clearMessage } from '../store/slices/authSlice';
import { updateProfile,} from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../data/disciplines';
import Section from '../components/Section';
import Field from '../components/Field';
import { Save, Upload, X, Check, User, MapPin, Globe, Calendar, Edit3, Eye, EyeOff, MessageCircle, Heart, Star, Image, Link } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg> },
  { key: 'facebook', label: 'Facebook', color: '#1877F2',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
  { key: 'twitter', label: 'X / Twitter', color: '#000000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { key: 'tiktok', label: 'TikTok', color: '#010101',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" /></svg> },
  { key: 'youtube', label: 'YouTube', color: '#FF0000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
];

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Italian', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Hindi', 'Korean', 'Indonesian', 'Russian', 'Polish', 'Cantonese', 'Ukrainian', 'Nigerian', 'Thai'];
const OPEN_TO = ['Direct Hire', 'Swaps', 'Both', 'Energy Exchange'];

/* Scalloped / wavy-edge profile frame (SVG-based) */
function ScallopedFrame({ size = 200, borderWidth = 2, children, className = '', onClick }) {
  const uid = useId();
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2 - borderWidth;
  const bumps = 12;
  const bumpDepth = r * 0.13;

  let path = '';
  for (let i = 0; i < bumps; i++) {
    const a1 = (i / bumps) * Math.PI * 2;
    const a2 = ((i + 1) / bumps) * Math.PI * 2;
    const aMid = (a1 + a2) / 2;

    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xMid = cx + (r - bumpDepth) * Math.cos(aMid);
    const yMid = cy + (r - bumpDepth) * Math.sin(aMid);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);

    if (i === 0) path += `M ${x1} ${y1} `;
    path += `Q ${xMid} ${yMid} ${x2} ${y2} `;
  }
  path += 'Z';

  const clipId = `scallop${uid}`;

  return (
    <div className={`relative ${className}`} style={{ width: s, height: s }} onClick={onClick}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="absolute inset-0 z-[1]" style={{ pointerEvents: 'none' }}>
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill="none" stroke="#3E3D38" strokeWidth={borderWidth} />
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `url(#${clipId})` }}>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  // Map API user fields into form-friendly flat structure
  const [form, setForm] = useState(() => {
    if (!user) return {};
    // social_links is array of { platform, url } — flatten into form keys
    const socialsMap = {};
    (user.social_links || []).forEach((s) => {
      if (s.platform && s.url) socialsMap[s.platform] = s.url;
    });
    return {
      ...user,
      avatarPreview: user.profile_picture || null,
      coverImage: user.background_image || null,
      photos: user.gallery_photos || [],
      instagram: socialsMap.instagram || '',
      facebook: socialsMap.facebook || '',
      twitter: socialsMap.twitter || '',
      tiktok: socialsMap.tiktok || '',
      youtube: socialsMap.youtube || '',
      linkedin: socialsMap.linkedin || '',
    };
  });
  const [saved, setSaved] = useState(false);
  const [discSearch, setDiscSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState([
    { name: 'Lina Chen', rating: 5, text: 'Amazing energy and super professional. Made our studio swap seamless!', date: 'Mar 2026' },
    { name: 'Studio Vinyasa Bali', rating: 4, text: 'Great instructor, students loved the classes. Would collaborate again.', date: 'Feb 2026' },
  ]);
  const fileRef = useRef();
  const photosRef = useRef();
  const coverRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key]?.includes(val) ? f[key].filter(i => i !== val) : [...(f[key] || []), val]
    }));
  };

  const toggleSelectAll = (categoryItems) => {
    const currentDisc = form.disciplines || [];
    const allSelected = categoryItems.every(d => currentDisc.includes(d));
    if (allSelected) {
      setForm(f => ({ ...f, disciplines: currentDisc.filter(d => !categoryItems.includes(d)) }));
    } else {
      const newItems = categoryItems.filter(d => !currentDisc.includes(d));
      setForm(f => ({ ...f, disciplines: [...currentDisc, ...newItems] }));
    }
  };

  const handleSave = async () => {
    // Build API-shaped payload from flat form
    const { avatarPreview, coverImage, photos, instagram, facebook, twitter, tiktok, youtube, linkedin, ...rest } = form;
    const payload = {
      ...rest,
      profile_picture: avatarPreview,
      background_image: coverImage,
      gallery_photos: photos || [],
      social_links: [
        ...(instagram ? [{ platform: 'instagram', url: instagram }] : []),
        ...(facebook ? [{ platform: 'facebook', url: facebook }] : []),
        ...(twitter ? [{ platform: 'twitter', url: twitter }] : []),
        ...(tiktok ? [{ platform: 'tiktok', url: tiktok }] : []),
        ...(youtube ? [{ platform: 'youtube', url: youtube }] : []),
        ...(linkedin ? [{ platform: 'linkedin', url: linkedin }] : []),
      ],
    };
    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('avatarPreview', URL.createObjectURL(file));
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - (form.photos?.length || 0));
    const previews = files.map(f => URL.createObjectURL(f));
    set('photos', [...(form.photos || []), ...previews]);
  };

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('coverImage', URL.createObjectURL(file));
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || reviewRating === 0) return;
    setReviews(prev => [{ name: 'You', rating: reviewRating, text: reviewText, date: 'Just now' }, ...prev]);
    setReviewText('');
    setReviewRating(0);
    setShowReviewForm(false);
  };

  const filteredCats = DISCIPLINE_CATEGORIES.map(c => ({
    ...c,
    items: c.items.filter(d => !discSearch || d.toLowerCase().includes(discSearch.toLowerCase()))
  })).filter(c => c.items.length > 0);

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'MG';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Edit Profile</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Manage how studios and instructors find you</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#3E3D38] transition-all"
          >
            {showPreview ? <><EyeOff size={15} /> Hide Preview</> : <><Eye size={15} /> Preview</>}
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
              ${saved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#CE4F56] text-white hover:bg-[#b8454c]'
              }`}
          >
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Profile Preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-2">
            <Eye size={15} className="text-[#9A9A94]" />
            <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Profile Preview</h3>
            <span className="text-[10px] text-[#9A9A94] ml-auto">This is how others see your profile</span>
          </div>
          <div className="p-6">
            <div className="max-w-md mx-auto">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/30 rounded-2xl border border-[#E5E0D8]">
                {/* Cover + Avatar wrapper (no overflow-hidden so avatar can extend) */}
                <div className="relative">
                  {/* Cover image - click to preview */}
                  <div
                    className={`h-32 rounded-t-2xl overflow-hidden ${form.coverImage ? 'cursor-pointer' : ''}`}
                    style={{
                      background: form.coverImage ? `url(${form.coverImage}) center/cover no-repeat` : 'linear-gradient(135deg, #CE4F56 0%, #E89560 40%, #f5fca6 70%, #6BE6A4 100%)'
                    }}
                    onClick={() => form.coverImage && setShowCoverModal(true)}
                  >
                    {/* Favourite button */}
                    <button
                      onClick={() => setIsFavourited(!isFavourited)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm z-20
                        ${isFavourited ? 'bg-[#CE4F56] scale-110' : 'bg-white/30 hover:bg-white/50'}`}
                    >
                      <Heart size={14} className={isFavourited ? 'text-white fill-white' : 'text-white'} />
                    </button>
                  </div>

                  {/* Avatar - scalloped frame, click to view full */}
                  <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 z-10">
                    <button onClick={() => setShowAvatarModal(true)} className="block focus:outline-none group hover:scale-105 transition-transform">
                      <ScallopedFrame size={88} borderWidth={2}>
                        <div className="w-full h-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center">
                          {form.avatarPreview
                            ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                            : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>
                          }
                        </div>
                      </ScallopedFrame>
                    </button>
                  </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                  {/* Name & basics */}
                  <h2 className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">
                    {form.name || 'Your Name'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {form.age && <span className="text-[#9A9A94] text-xs">{form.age} yrs</span>}
                    {form.pronouns && <span className="text-[#9A9A94] text-xs">{form.pronouns}</span>}
                  </div>
                  {form.studio && (
                    <p className="text-[#CE4F56] text-xs font-semibold mt-1">{form.studio}</p>
                  )}

                  {/* Status + Message button */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
                      ${form.profileStatus === 'active'
                        ? 'bg-[#6BE6A4]/20 text-[#3E3D38]'
                        : 'bg-[#EDE8DF] text-[#9A9A94]'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.profileStatus === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                      {form.profileStatus === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                    </span>
                    <button
                      onClick={() => navigate('/portal/messages')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#CE4F56] text-white hover:bg-[#b8454c] transition-colors"
                    >
                      <MessageCircle size={10} />
                      Message
                    </button>
                  </div>

                  {/* Social Links */}
                  {SOCIAL_PLATFORMS.some(p => form[p.key]) && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {SOCIAL_PLATFORMS.filter(p => form[p.key]).map(p => (
                        <a key={p.key} href={form[p.key]} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                          style={{ backgroundColor: p.color + '15', color: p.color }}
                          title={p.label}
                        >
                          {p.icon}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {form.bio && (
                    <p className="text-[#6B6B66] text-xs leading-relaxed mt-4 text-left">{form.bio}</p>
                  )}

                  {/* Location info */}
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    {form.location && (
                      <div className="bg-[#EDE8DF]/50 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider">Location</p>
                        <p className="text-[#3E3D38] text-xs mt-0.5">{form.location}</p>
                      </div>
                    )}
                    {form.countryFrom && (
                      <div className="bg-[#EDE8DF]/50 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider">From</p>
                        <p className="text-[#3E3D38] text-xs mt-0.5">{form.countryFrom}</p>
                      </div>
                    )}
                    {form.travelingTo && (
                      <div className="bg-[#EDE8DF]/50 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider">Traveling To</p>
                        <p className="text-[#3E3D38] text-xs mt-0.5">{form.travelingTo}</p>
                      </div>
                    )}
                    {form.availability && (
                      <div className="bg-[#EDE8DF]/50 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider">Available</p>
                        <p className="text-[#3E3D38] text-xs mt-0.5">{form.availability}</p>
                      </div>
                    )}
                  </div>

                  {/* Open To */}
                  {(form.openTo || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider mb-2">Open To</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(Array.isArray(form.openTo) ? form.openTo : [form.openTo]).map(o => (
                          <span key={o} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#E89560]/15 text-[#E89560]">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disciplines */}
                  {(form.disciplines || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider mb-2">Disciplines</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(form.disciplines || []).map(d => (
                          <span key={d} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#CE4F56]/10 text-[#CE4F56]">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {(form.languages || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider mb-2">Languages</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(form.languages || []).map(l => (
                          <span key={l} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#EDE8DF] text-[#6B6B66]">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {(form.photos || []).length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-5">
                      {(form.photos || []).map((p, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviews Section */}
                  <div className="mt-6 pt-5 border-t border-[#E5E0D8]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider font-bold">Reviews ({reviews.length})</p>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="text-[10px] font-semibold text-[#CE4F56] hover:underline"
                      >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                      </button>
                    </div>

                    {/* Review form */}
                    {showReviewForm && (
                      <div className="bg-[#EDE8DF]/50 rounded-xl p-3 mb-3 text-left">
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setReviewRating(s)} type="button">
                              <Star size={14} className={`transition-colors ${s <= reviewRating ? 'text-[#E89560] fill-[#E89560]' : 'text-[#E5E0D8]'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          rows={2}
                          maxLength={200}
                          placeholder="How was your experience working together?"
                          className="w-full border border-[#E5E0D8] rounded-lg px-3 py-2 text-[11px] resize-none focus:outline-none focus:border-[#CE4F56] bg-white"
                        />
                        <button
                          onClick={handleSubmitReview}
                          className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold bg-[#CE4F56] text-white hover:bg-[#b8454c] transition-colors"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}

                    {/* Review list */}
                    <div className="space-y-2.5">
                      {reviews.map((r, i) => (
                        <div key={i} className="bg-[#EDE8DF]/30 rounded-xl p-3 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-[#3E3D38]">{r.name}</span>
                            <span className="text-[9px] text-[#9A9A94]">{r.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={9} className={s <= r.rating ? 'text-[#E89560] fill-[#E89560]' : 'text-[#E5E0D8]'} />
                            ))}
                          </div>
                          <p className="text-[11px] text-[#6B6B66] leading-relaxed">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar & Status */}
      <Section title="Profile Identity" icon={User}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar - scalloped frame */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="cursor-pointer group" onClick={() => fileRef.current?.click()}>
              <ScallopedFrame size={96} borderWidth={2}>
                <div className="w-full h-full bg-gradient-to-br from-[#d4f53c] to-[#e8834a] flex items-center justify-center relative">
                  {form.avatarPreview
                    ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                    : <span className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">{initials}</span>
                  }
                  <div className="absolute inset-0 bg-[#3E3D38]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
              </ScallopedFrame>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <p className="text-[10px] text-[#9A9A94] text-center mt-2">Click to change</p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input value={form.name || ''} onChange={e => set('name', e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
              </Field>
              <Field label="Age">
                <input type="number" value={form.age || ''} onChange={e => set('age', e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pronouns">
                <select value={form.pronouns || ''} onChange={e => set('pronouns', e.target.value)}
                  className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white">
                  <option value="">Select...</option>
                  {PRONOUNS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Studio / Workplace">
                <input value={form.studio || ''} onChange={e => set('studio', e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
              </Field>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <div className="mt-5 pt-5 border-t border-[#E5E0D8]">
          <Field label="Profile Status" hint="Active profiles appear in search results">
            <div className="flex gap-2 mt-1 justify-center">
              {['active', 'inactive'].map(s => (
                <button key={s} type="button" onClick={() => set('profileStatus', s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === s
                      ? s === 'active' ? 'bg-[#CE4F56] border-[#CE4F56] text-[#3E3D38]' : 'bg-[#3E3D38] border-[#3E3D38] text-white'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56]'
                    }`}>
                  <span className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-500' : 'bg-[#9A9A94]'}`} />
                  {s === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Background image upload */}
        <div className="mt-5 pt-5 border-t border-[#E5E0D8]">
          <Field label="Profile Background" hint="Upload a personalised cover image for your profile">
            <div className="mt-2">
              {form.coverImage ? (
                <div className="relative rounded-xl overflow-hidden h-28 group">
                  <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#3E3D38]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" onClick={() => coverRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#3E3D38] hover:bg-[#f5fca6] transition-colors">
                      Change
                    </button>
                    <button type="button" onClick={() => set('coverImage', null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/80 text-red-500 hover:bg-white transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="h-28 rounded-xl border-2 border-dashed border-[#E5E0D8] flex flex-col items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors bg-gradient-to-r from-[#CE4F56]/5 to-[#E89560]/5"
                  onClick={() => coverRef.current?.click()}
                >
                  <Image size={22} className="text-[#3E3D38]/20" />
                  <p className="text-[10px] text-[#3E3D38]/30 mt-1 font-medium">Upload Background Image</p>
                </div>
              )}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImage} />
            </div>
          </Field>
        </div>

        {/* Social Links */}
        <div className="mt-5 pt-5 border-t border-[#E5E0D8]">
          <Field label="Social Links" hint="Add your social media profiles so others can find you">
            <div className="grid grid-cols-2 gap-3 mt-2">
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.key} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: p.color + '15', color: p.color }}>
                    {p.icon}
                  </div>
                  <input
                    value={form[p.key] || ''}
                    onChange={e => set(p.key, e.target.value)}
                    placeholder={`${p.label} URL`}
                    className="flex-1 border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#CE4F56] bg-white"
                  />
                </div>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      {/* Bio */}
      <Section title="Bio" icon={Edit3}>
        <Field label={`About You (${(form.bio || '').length}/500)`}>
          <textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)}
            rows={5} maxLength={500}
            placeholder="Tell studios and instructors about yourself, your style, and what you're looking for..."
            className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#CE4F56] bg-white" />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location & Travel" icon={MapPin}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current Location">
              <input value={form.location || ''} onChange={e => set('location', e.target.value)}
                placeholder="City, Country"
                className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
            </Field>
            <Field label="Country From">
              <input value={form.countryFrom || ''} onChange={e => set('countryFrom', e.target.value)}
                placeholder="e.g. Australia"
                className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Traveling To">
              <input value={form.travelingTo || ''} onChange={e => set('travelingTo', e.target.value)}
                placeholder="e.g. South America, Italy"
                className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
            </Field>
            <Field label="Availability">
              <input value={form.availability || ''} onChange={e => set('availability', e.target.value)}
                placeholder="e.g. Aug – Oct 2026"
                className="w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white" />
            </Field>
          </div>

          <Field label="Open To">
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
              {OPEN_TO.map(opt => (
                <button key={opt} type="button" onClick={() => toggle('openTo', opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${(form.openTo || []).includes(opt)
                      ? 'bg-[#3E3D38] border-[#3E3D38] text-white'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56]'
                    }`}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      {/* Languages */}
      <Section title="Languages" icon={Globe}>
        <div className="flex flex-wrap gap-2 justify-center">
          {LANGUAGES.map(lang => (
            <button key={lang} type="button" onClick={() => toggle('languages', lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${(form.languages || []).includes(lang)
                  ? 'bg-[#CE4F56] border-[#CE4F56] text-[#3E3D38]'
                  : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56]'
                }`}>
              {lang}
            </button>
          ))}
        </div>
      </Section>

      {/* Disciplines */}
      <Section title="Disciplines" icon={Calendar}>
        {/* Selected */}
        {(form.disciplines || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#CE4F56]/15 rounded-xl border border-[#CE4F56]/30 justify-center">
            {(form.disciplines || []).map(d => (
              <span key={d} className="flex items-center gap-1 bg-[#CE4F56] text-[#3E3D38] text-xs font-medium px-2.5 py-1 rounded-full">
                {d}
                <button type="button" onClick={() => toggle('disciplines', d)}><X size={9} /></button>
              </span>
            ))}
          </div>
        )}

        <input type="text" value={discSearch} onChange={e => setDiscSearch(e.target.value)}
          placeholder="Search disciplines..."
          className="w-full border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white mb-4" />

        <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
          {filteredCats.map(cat => {
            const allSelected = cat.items.every(d => (form.disciplines || []).includes(d));
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-[#9A9A94] tracking-widest uppercase">
                    {cat.emoji} {cat.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(cat.items)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all
                      ${allSelected
                        ? 'bg-[#3E3D38] text-white'
                        : 'bg-[#EDE8DF] text-[#6B6B66] hover:bg-[#E5E0D8] hover:text-[#3E3D38]'
                      }`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {cat.items.map(d => (
                    <button key={d} type="button" onClick={() => toggle('disciplines', d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${(form.disciplines || []).includes(d)
                          ? 'bg-[#3E3D38] border-[#3E3D38] text-white'
                          : 'border-[#E5E0D8] text-[#3E3D38] hover:border-[#CE4F56] hover:bg-[#EDE8DF]'
                        }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Photos */}
      <Section title="Gallery Photos" icon={Upload}>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {(form.photos || []).map((p, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#EDE8DF] relative group">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-[#3E3D38]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          {(form.photos || []).length < 4 && (
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-[#E5E0D8] flex flex-col items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors"
              onClick={() => photosRef.current?.click()}
            >
              <Upload size={18} className="text-[#3E3D38]/25" />
              <p className="text-[10px] text-[#3E3D38]/25 mt-1">Add</p>
            </div>
          )}
        </div>
        <input ref={photosRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
        <p className="text-[10px] text-[#9A9A94] text-center">Up to 4 gallery photos + 1 main profile photo</p>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-center pb-4">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300
            ${saved ? 'bg-emerald-500 text-white' : 'bg-[#CE4F56] text-[#3E3D38] hover:bg-[#c4e530]'}`}
        >
          {saved ? <><Check size={15} /> Changes Saved!</> : <><Save size={15} /> Save All Changes</>}
        </button>
      </div>

      {/* Funky Avatar Modal - only shows when user clicks profile picture */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E3D38]/70 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setShowAvatarModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-[#EDE8DF] transition-colors">
              <X size={14} className="text-[#3E3D38]" />
            </button>

            {/* Scalloped frame - large */}
            <ScallopedFrame size={280} borderWidth={2.5}>
              <div className="w-full h-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center shadow-2xl">
                {form.avatarPreview
                  ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="font-['Unbounded'] text-5xl font-black text-white">{initials}</span>
                }
              </div>
            </ScallopedFrame>

            {/* Name below */}
            <p className="text-center mt-5 font-['Unbounded'] text-lg font-black text-white">{form.name || 'Your Name'}</p>
            {form.studio && <p className="text-center text-white/60 text-sm mt-1">{form.studio}</p>}

            {/* Social icons in modal */}
            {SOCIAL_PLATFORMS.some(p => form[p.key]) && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {SOCIAL_PLATFORMS.filter(p => form[p.key]).map(p => (
                  <a key={p.key} href={form[p.key]} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all"
                    title={p.label}
                  >
                    {p.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cover Image Preview Modal */}
      {showCoverModal && form.coverImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E3D38]/80 backdrop-blur-sm p-4" onClick={() => setShowCoverModal(false)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCoverModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-[#EDE8DF] transition-colors">
              <X size={14} className="text-[#3E3D38]" />
            </button>
            <img src={form.coverImage} alt="Cover" className="w-full rounded-2xl border-2 border-[#3E3D38] shadow-2xl object-cover max-h-[70vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
