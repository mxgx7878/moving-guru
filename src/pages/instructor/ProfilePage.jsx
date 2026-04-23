import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/actions/authAction';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { COUNTRIES, COUNTRIES_AND_REGIONS } from '../../data/countries';
import { Section, Field, SelectField, Button } from '../../components/ui';
import { ReviewList } from '../../features/reviews';
import { ScallopedFrame } from '../../features/profile';
import { formatDateRange } from '../../utils/formatters';
import {
  Save, Upload, X, Check, User, MapPin, Globe, Calendar,
  Edit3, Eye, EyeOff, MessageCircle, Heart, Star, Image,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> },
  { key: 'facebook', label: 'Facebook', color: '#1877F2',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { key: 'twitter', label: 'X / Twitter', color: '#000000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { key: 'tiktok', label: 'TikTok', color: '#010101',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg> },
  { key: 'youtube', label: 'YouTube', color: '#FF0000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
];

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];
const LANGUAGES = ['English','Spanish','French','Portuguese','Italian','German','Japanese','Mandarin','Arabic','Hindi','Korean','Indonesian','Russian','Polish','Cantonese','Ukrainian','Nigerian','Thai'];
const OPEN_TO = ['Direct Hire', 'Swaps', 'Energy Exchange'];

// ─── Main component ──────────────────────────────────────────────
export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    if (!user) return {};
    const socialsMap = {};
    (user.social_links || []).forEach(obj => {
      if (!obj) return;
      const key = Object.keys(obj)[0];
      if (key) socialsMap[key] = obj[key];
    });
    return {
      ...user,
      avatarPreview: user.profile_picture || null,
      coverImage: user.background_image || null,
      photos: user.gallery_photos || [],
      availableFrom: user.available_from || user.availableFrom || '',
      availableTo:   user.available_to   || user.availableTo   || '',
      countryFrom:   user.country_from   || user.countryFrom   || '',
      travelingTo:   user.traveling_to   || user.travelingTo   || '',
      profileStatus: user.profile_status || user.profileStatus || 'active',
      openTo:        user.open_to        || user.openTo        || [],
      ...socialsMap,
    };
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discSearch, setDiscSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileRef = useRef();
  const photosRef = useRef();
  const coverRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (key, val) => setForm(f => ({
    ...f,
    [key]: (f[key] || []).includes(val)
      ? (f[key] || []).filter(i => i !== val)
      : [...(f[key] || []), val],
  }));

  const toggleSelectAll = (items) => {
    const cur = form.disciplines || [];
    const allSel = items.every(d => cur.includes(d));
    if (allSel) {
      set('disciplines', cur.filter(d => !items.includes(d)));
    } else {
      set('disciplines', [...cur, ...items.filter(d => !cur.includes(d))]);
    }
  };

  // ─── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);

    const {
      avatarPreview, coverImage, photos,
      avatarFile, coverFile, photoFiles,
      instagram, facebook, twitter, tiktok, youtube, linkedin,
      profile_picture, background_image, gallery_photos, social_links,
      countryFrom, travelingTo, profileStatus, openTo,
      availableFrom, availableTo,
      ...rest
    } = form;

    const fd = new FormData();

    Object.entries(rest).forEach(([key, val]) => {
      if (val == null) return;
      if (Array.isArray(val)) {
        val.forEach((item, i) => fd.append(`${key}[${i}]`, item));
      } else {
        fd.append(key, val);
      }
    });

    fd.append('countryFrom',   countryFrom   || '');
    fd.append('travelingTo',   travelingTo   || '');
    fd.append('profileStatus', profileStatus || 'active');
    fd.append('availableFrom', availableFrom || '');
    fd.append('availableTo',   availableTo   || '');
    fd.append('availability',  formatDateRange(availableFrom, availableTo));

    (openTo || []).forEach((o, i) => fd.append(`openTo[${i}]`, o));

    if (avatarFile) fd.append('profile_picture', avatarFile);
    if (coverFile)  fd.append('background_image', coverFile);
    (photoFiles || []).forEach((f, i) => {
      if (f instanceof File) fd.append(`gallery_photos[${i}]`, f);
    });

    const socials = { instagram, facebook, twitter, tiktok, youtube, linkedin };
    let idx = 0;
    Object.entries(socials).forEach(([platform, url]) => {
      if (url) { fd.append(`social_links[${idx}][${platform}]`, url); idx++; }
    });

    const result = await dispatch(updateProfile(fd));
    setSaving(false);
    if (updateProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    set('avatarPreview', URL.createObjectURL(file));
    set('avatarFile', file);
  };
  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 4 - (form.photos?.length || 0));
    set('photos', [...(form.photos || []), ...newFiles.map(f => URL.createObjectURL(f))]);
    set('photoFiles', [...(form.photoFiles || []), ...newFiles]);
  };
  const handleCoverImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    set('coverImage', URL.createObjectURL(file));
    set('coverFile', file);
  };

  const filteredCats = DISCIPLINE_CATEGORIES.map(c => ({
    ...c, items: c.items.filter(d => !discSearch || d.toLowerCase().includes(discSearch.toLowerCase())),
  })).filter(c => c.items.length > 0);

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'MG';
  const availabilityDisplay = formatDateRange(form.availableFrom, form.availableTo);

  // ─── Input style ──────────────────────────────────────────────
  const inp = "w-full border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white text-[#3E3D38] placeholder-[#C4BCB4]";

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Edit Profile</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Manage how studios and instructors find you</p>
      </div>

      {/* ══════════════════════════════════════
           2-COLUMN LAYOUT
         ══════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ─────── LEFT COLUMN — Form sections ─────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Profile Preview Card (optional, toggled from sidebar) ── */}
          {showPreview && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-2">
                <Eye size={15} className="text-[#9A9A94]" />
                <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Profile Preview</h3>
                <span className="text-[10px] text-[#9A9A94] ml-auto">How others see your profile</span>
              </div>
              <div className="p-6">
                <div className="max-w-sm mx-auto bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/30 rounded-2xl border border-[#E5E0D8]">
                  {/* Cover */}
                  <div className="relative">
                    <div className="h-28 rounded-t-2xl overflow-hidden"
                      style={{ background: form.coverImage ? `url(${form.coverImage}) center/cover` : 'linear-gradient(135deg, #CE4F56, #E89560, #f5fca6, #6BE6A4)' }}>
                      <button onClick={() => setIsFavourited(!isFavourited)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all
                          ${isFavourited ? 'bg-[#CE4F56] scale-110' : 'bg-white/30 hover:bg-white/50'}`}>
                        <Heart size={14} className={isFavourited ? 'text-white fill-white' : 'text-white'} />
                      </button>
                    </div>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                      <button onClick={() => setShowAvatarModal(true)}>
                        <ScallopedFrame size={80} borderWidth={2}>
                          <div className="w-full h-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center">
                            {form.avatarPreview
                              ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                              : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>}
                          </div>
                        </ScallopedFrame>
                      </button>
                    </div>
                  </div>

                  <div className="pt-12 pb-5 px-5 text-center">
                    <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">{form.name || 'Your Name'}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1 text-[#9A9A94] text-xs">
                      {form.age && <span>{form.age}</span>}
                      {form.pronouns && <span>· {form.pronouns}</span>}
                    </div>
                    {form.studio && <p className="text-[#CE4F56] text-xs font-semibold mt-1">{form.studio}</p>}

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
                        ${form.profileStatus === 'active' ? 'bg-[#6BE6A4]/20 text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#9A9A94]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.profileStatus === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                        {form.profileStatus === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {form.bio && (
                        <div className="bg-[#FBF8E4]/50 rounded-xl p-2.5 col-span-2 text-left">
                          <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold">Bio</p>
                          <p className="text-[#3E3D38] text-[11px] mt-0.5 line-clamp-3">{form.bio.slice(0, 140)}{form.bio.length > 140 ? '...' : ''}</p>
                        </div>
                      )}
                      {(form.languages || []).length > 0 && (
                        <div className="bg-[#FBF8E4]/50 rounded-xl p-2.5">
                          <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold">Languages</p>
                          <p className="text-[#3E3D38] text-[11px] mt-0.5">{(form.languages || []).join(', ')}</p>
                        </div>
                      )}
                      {(form.countryFrom || form.travelingTo) && (
                        <div className="bg-[#FBF8E4]/50 rounded-xl p-2.5">
                          <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold">Country From → To</p>
                          <p className="text-[#3E3D38] text-[11px] mt-0.5">{form.countryFrom || '—'} → {form.travelingTo || '—'}</p>
                        </div>
                      )}
                      {availabilityDisplay && (
                        <div className="bg-[#FBF8E4]/50 rounded-xl p-2.5">
                          <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold">Availability</p>
                          <p className="text-[#3E3D38] text-[11px] mt-0.5">{availabilityDisplay}</p>
                        </div>
                      )}
                      {(form.openTo || []).length > 0 && (
                        <div className="bg-[#FBF8E4]/50 rounded-xl p-2.5">
                          <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold">Open To</p>
                          <p className="text-[#3E3D38] text-[11px] mt-0.5">{(form.openTo || []).join(', ')}</p>
                        </div>
                      )}
                    </div>

                    {(form.photos || []).length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mt-4">
                        {(form.photos || []).map((p, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
               SECTION 1 — IDENTITY
             ══════════════════════════════════════ */}
          <Section title="Profile Identity" icon={User}>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="cursor-pointer group" onClick={() => fileRef.current?.click()}>
                  <ScallopedFrame size={96} borderWidth={2}>
                    <div className="w-full h-full bg-gradient-to-br from-[#d4f53c] to-[#e8834a] flex items-center justify-center relative">
                      {form.avatarPreview
                        ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                        : <span className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">{initials}</span>}
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
                      placeholder="Your full name" className={inp} />
                  </Field>
                  <Field label="Age">
                    <input type="number" min="18" max="80" value={form.age || ''} onChange={e => set('age', e.target.value)}
                      placeholder="e.g. 30" className={inp} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pronouns">
                    <SelectField size="sm"
                      value={form.pronouns}
                      onChange={v => set('pronouns', v)}
                      options={PRONOUNS}
                      placeholder="Select pronouns..."
                    />
                  </Field>
                  <Field label="Current Studio / Employer">
                    <input value={form.studio || ''} onChange={e => set('studio', e.target.value)}
                      placeholder="e.g. STRIVE, Marrickville" className={inp} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="mt-5 pt-5 border-t border-[#E5E0D8]">
              <Field label="Cover Image" hint="Appears at the top of your public profile">
                <div
                  onClick={() => coverRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#CE4F56] transition-colors relative bg-[#FDFCF8]">
                  {form.coverImage ? (
                    <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Image size={22} className="text-[#3E3D38]/20" />
                      <p className="text-[10px] text-[#3E3D38]/30 mt-1 font-medium">Click to upload cover image</p>
                    </div>
                  )}
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImage} />
                </div>
              </Field>
            </div>

            {/* Social Links */}
            <div className="mt-5 pt-5 border-t border-[#E5E0D8]">
              <Field label="Social Links">
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {SOCIAL_PLATFORMS.map(p => (
                    <div key={p.key} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: p.color + '15', color: p.color }}>{p.icon}</div>
                      <input value={form[p.key] || ''} onChange={e => set(p.key, e.target.value)}
                        placeholder={`${p.label} URL`}
                        className="flex-1 border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#CE4F56] bg-white text-[#3E3D38] placeholder-[#C4BCB4]" />
                    </div>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 2 — BIO
             ══════════════════════════════════════ */}
          <Section title="Bio" icon={Edit3}>
            <Field label={`About You (${(form.bio || '').length}/500)`}>
              <textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)}
                rows={4} maxLength={500}
                placeholder="Tell studios and instructors about yourself, your experience, and your teaching style..."
                className={`${inp} resize-none`} />
            </Field>
            <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
              <Field label={`What I'm Looking For (${(form.lookingFor || '').length}/2500)`}
                hint="Describe your ideal opportunity — paid work, swap, or exchange">
                <textarea value={form.lookingFor || ''} onChange={e => set('lookingFor', e.target.value)}
                  rows={5} maxLength={2500}
                  placeholder="e.g. Looking for a 3-month placement in Europe over summer. Open to studio swaps, direct hire, or energy exchange. Flexible on dates..."
                  className={`${inp} resize-none`} />
              </Field>
            </div>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 3 — LOCATION & TRAVEL
             ══════════════════════════════════════ */}
          <Section title="Location & Travel" icon={MapPin}>
            <div className="space-y-4">

              {/* Current location */}
              <Field label="Current Location" hint="City and country where you currently live">
                <input value={form.location || ''} onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Sydney, Australia" className={inp} />
              </Field>

              {/* Country From → Traveling To */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country From">
                  <SelectField size="sm"
                    value={form.countryFrom}
                    onChange={v => set('countryFrom', v)}
                    options={COUNTRIES}
                    placeholder="Select your country..."
                  />
                </Field>
                <Field label="Traveling To" hint="Countries or regions you plan to visit">
                  <div className="space-y-2">
                    <SelectField size="sm"
                      value={form.travelingTo?.split(',')[0]?.trim() || ''}
                      onChange={v => set('travelingTo', v)}
                      options={COUNTRIES_AND_REGIONS}
                      placeholder="Select destination..."
                    />
                    <input value={form.travelingTo || ''} onChange={e => set('travelingTo', e.target.value)}
                      placeholder="Or type multiple: Italy, Bali, Thailand"
                      className={`${inp} text-xs`} />
                  </div>
                </Field>
              </div>

              {/* Availability — date range picker */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
                  Availability Dates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#9A9A94] mb-1.5">Available From</p>
                    <input type="date" value={form.availableFrom || ''} onChange={e => set('availableFrom', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={inp} />
                  </div>
                  <div>
                    <p className="text-xs text-[#9A9A94] mb-1.5">Available To</p>
                    <input type="date" value={form.availableTo || ''} onChange={e => set('availableTo', e.target.value)}
                      min={form.availableFrom || new Date().toISOString().split('T')[0]}
                      className={inp} />
                  </div>
                </div>
                {availabilityDisplay && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-[#2DA4D6]/10 rounded-lg w-fit">
                    <Calendar size={12} className="text-[#2DA4D6]" />
                    <span className="text-[#2DA4D6] text-xs font-semibold">{availabilityDisplay}</span>
                  </div>
                )}
              </div>

              {/* Flexible dates note */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="flexible" checked={!!form.flexibleDates}
                  onChange={e => set('flexibleDates', e.target.checked)}
                  className="w-4 h-4 rounded border-[#E5E0D8] accent-[#2DA4D6]" />
                <label htmlFor="flexible" className="text-sm text-[#6B6B66] cursor-pointer">
                  I'm flexible with dates
                </label>
              </div>

              {/* Open To */}
              <Field label="Open To" hint="What type of arrangement are you looking for?">
                <div className="flex flex-wrap gap-2 mt-1">
                  {OPEN_TO.map(opt => (
                    <button key={opt} type="button" onClick={() => toggle('openTo', opt)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                        ${(form.openTo || []).includes(opt)
                          ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                          : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {(form.openTo || []).length === 0 && (
                  <p className="text-[10px] text-[#C4BCB4] mt-1">Select at least one option</p>
                )}
              </Field>
            </div>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 4 — LANGUAGES
             ══════════════════════════════════════ */}
          <Section title="Languages" icon={Globe}>
            <p className="text-xs text-[#9A9A94] mb-3">Select all languages you speak or are learning</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang} type="button" onClick={() => toggle('languages', lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${(form.languages || []).includes(lang)
                      ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                      : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 5 — DISCIPLINES
             ══════════════════════════════════════ */}
          <Section title="Disciplines" icon={Star}>
            {/* Selected tags */}
            {(form.disciplines || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#2DA4D6]/10 rounded-xl border border-[#2DA4D6]/20">
                <p className="w-full text-[10px] text-[#2DA4D6] font-bold uppercase tracking-wider mb-1">
                  Selected ({form.disciplines.length})
                </p>
                {(form.disciplines || []).map(d => (
                  <span key={d} className="flex items-center gap-1 bg-[#2DA4D6] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {d}
                    <button type="button" onClick={() => toggle('disciplines', d)}>
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2 mb-4">
              <Star size={14} className="text-[#9A9A94]" />
              <input type="text" value={discSearch} onChange={e => setDiscSearch(e.target.value)}
                placeholder="Search disciplines..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
              {discSearch && <button onClick={() => setDiscSearch('')}><X size={12} className="text-[#9A9A94]" /></button>}
            </div>

            {/* Category list */}
            <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
              {filteredCats.map(cat => {
                const allSel = cat.items.every(d => (form.disciplines || []).includes(d));
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-bold text-[#9A9A94] tracking-widest uppercase">
                        {cat.emoji} {cat.label}
                      </p>
                      <button type="button" onClick={() => toggleSelectAll(cat.items)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all
                          ${allSel ? 'bg-[#CCFF00] text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E6FF80]'}`}>
                        {allSel ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map(d => (
                        <button key={d} type="button" onClick={() => toggle('disciplines', d)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                            ${(form.disciplines || []).includes(d)
                              ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                              : 'border-[#E5E0D8] text-[#3E3D38] hover:border-[#2DA4D6] hover:bg-[#FBF8E4]'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 6 — GALLERY PHOTOS
             ══════════════════════════════════════ */}
          <Section title="Gallery Photos" icon={Upload}>
            <p className="text-xs text-[#9A9A94] mb-3">Add up to 4 photos showing your teaching, studio, or travels</p>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {(form.photos || []).map((p, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#FBF8E4] relative group">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => {
                      set('photos', form.photos.filter((_, j) => j !== i));
                      set('photoFiles', (form.photoFiles || []).filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-[#3E3D38]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {(form.photos || []).length < 4 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-[#E5E0D8] flex flex-col items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors"
                  onClick={() => photosRef.current?.click()}>
                  <Upload size={18} className="text-[#3E3D38]/25" />
                  <p className="text-[10px] text-[#3E3D38]/25 mt-1">Add</p>
                </div>
              )}
            </div>
            <input ref={photosRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            <p className="text-[10px] text-[#9A9A94] text-center">Up to 4 gallery photos + 1 main profile photo</p>
          </Section>

          {/* ══════════════════════════════════════
               SECTION 7 — REVIEWS FROM STUDIOS
             ══════════════════════════════════════ */}
          <Section title="Reviews from Studios" icon={Star}>
            <p className="text-xs text-[#9A9A94] mb-4">
              Feedback from studios who've hired you. Studios can review you after an accepted job application.
            </p>
            <ReviewList
              userId={user?.user_id}
              direction="studio_to_instructor"
              emptyLabel="No reviews yet — studios can leave a review after hiring you on Moving Guru."
            />
          </Section>

        </div>

        {/* ─────── RIGHT COLUMN — Sticky sidebar ─────── */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-5">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Profile Photo
              </p>
              <div className="flex flex-col items-center">
                <div className="cursor-pointer group" onClick={() => fileRef.current?.click()}>
                  <ScallopedFrame size={140} borderWidth={2.5}>
                    <div className="w-full h-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center relative">
                      {form.avatarPreview
                        ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                        : <span className="font-['Unbounded'] text-3xl font-black text-white">{initials}</span>}
                      <div className="absolute inset-0 bg-[#3E3D38]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={22} className="text-white" />
                      </div>
                    </div>
                  </ScallopedFrame>
                </div>
                <p className="text-center text-sm font-semibold text-[#3E3D38] font-['Unbounded'] mt-3 truncate max-w-full">
                  {form.name || 'Your Name'}
                </p>
                {form.studio && (
                  <p className="text-center text-[10px] text-[#CE4F56] font-semibold mt-0.5 truncate max-w-full">
                    {form.studio}
                  </p>
                )}
                <p className="text-[10px] text-[#9A9A94] text-center mt-2">Click photo to change</p>
              </div>
            </div>

            {/* Status toggle */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Profile Status
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set('profileStatus', 'active')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === 'active'
                      ? 'bg-[#6BE6A4]/20 border-[#6BE6A4] text-[#3E3D38]'
                      : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#6BE6A4]'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${form.profileStatus === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => set('profileStatus', 'inactive')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === 'inactive'
                      ? 'bg-[#FBF8E4] border-[#9A9A94] text-[#6B6B66]'
                      : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#9A9A94]'}`}
                >
                  Inactive
                </button>
              </div>
              <p className="text-[10px] text-[#9A9A94] mt-2 leading-relaxed">
                {form.profileStatus === 'active'
                  ? 'Visible to studios in search results'
                  : 'Hidden from search'}
              </p>
            </div>

            {/* Gallery mini-grid */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Gallery ({(form.photos || []).length}/4)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(form.photos || []).map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#FBF8E4] relative group">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        set('photos', form.photos.filter((_, j) => j !== i));
                        set('photoFiles', (form.photoFiles || []).filter((_, j) => j !== i));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-[#3E3D38]/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                {(form.photos || []).length < 4 && (
                  <div
                    onClick={() => photosRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#E5E0D8] flex flex-col items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors">
                    <Upload size={16} className="text-[#3E3D38]/25" />
                    <p className="text-[9px] text-[#3E3D38]/30 mt-1">Add</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons — sticky Save */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 space-y-2">
              <Button
                variant={saved ? 'success' : 'primary'}
                size="lg"
                fullWidth
                loading={saving}
                icon={saved ? Check : Save}
                onClick={handleSave}
              >
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                icon={showPreview ? EyeOff : Eye}
                onClick={() => setShowPreview(!showPreview)}
                className="hover:border-[#CE4F56] hover:text-[#CE4F56]"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>

          </div>
        </aside>
      </div>

      {/* Avatar full preview modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E3D38]/70 backdrop-blur-sm"
          onClick={() => setShowAvatarModal(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAvatarModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-[#FBF8E4] transition-colors">
              <X size={14} className="text-[#3E3D38]" />
            </button>
            <ScallopedFrame size={280} borderWidth={2.5}>
              <div className="w-full h-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center">
                {form.avatarPreview
                  ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="font-['Unbounded'] text-5xl font-black text-white">{initials}</span>}
              </div>
            </ScallopedFrame>
            <p className="text-center mt-5 font-['Unbounded'] text-lg font-black text-white">{form.name}</p>
            {form.studio && <p className="text-center text-white/60 text-sm mt-1">{form.studio}</p>}
          </div>
        </div>
      )}
    </div>
  );
}