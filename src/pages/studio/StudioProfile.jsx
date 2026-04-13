import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import {
  Upload, X, MapPin, Globe, Phone,
  Instagram, Save, Eye, Building2, ExternalLink, MessageCircle, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoader } from '../../components/feedback';

const OPEN_TO = ['Direct Hire', 'Swaps', 'Energy Exchange'];
const STUDIO_SIZES = ['1–5 instructors', '6–15 instructors', '16–30 instructors', '30+ instructors'];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function StudioProfile() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((s) => s.auth);
  const avatarRef = useRef();
  const photosRef = useRef();
  const saving = status === STATUS.LOADING;

  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    studioName: user?.studio_name || user?.studioName || '',
    contactName: user?.contact_name || user?.name || '',
    location: user?.location || '',
    country: user?.country || '',
    phone: user?.phone || '',
    website: user?.website || '',
    studioSize: user?.studio_size || user?.studioSize || '',
    bio: user?.bio || '',
    openTo: user?.open_to || user?.openTo || [],
    disciplines: user?.disciplines || [],
    instagram: user?.instagram || '',
    profileStatus: user?.profile_status || user?.profileStatus || 'active',
    avatarPreview: user?.profile_picture || null,
    photos: user?.gallery_photos || [],
    // new file objects
    avatarFile: null,
    photoFiles: [],
  });
  const [disciplineSearch, setDisciplineSearch] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleItem = (k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(i => i !== v) : [...f[k], v],
  }));

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    update('avatarPreview', URL.createObjectURL(file));
    update('avatarFile', file);
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    update('photoFiles', files);
    update('photos', files.map(f => URL.createObjectURL(f)));
  };

const handleSave = async () => {
    const fd = new FormData();
 
    fd.append('studioName',    form.studioName   || '');  // ✅ camelCase
    fd.append('contactName',   form.contactName  || '');  // ✅ camelCase
    fd.append('location',      form.location     || '');
    fd.append('country',       form.country      || '');
    fd.append('phone',         form.phone        || '');
    fd.append('website',       form.website      || '');
    fd.append('studioSize',    form.studioSize   || '');  // ✅ camelCase
    fd.append('bio',           form.bio          || '');
    fd.append('instagram',     form.instagram    || '');
    fd.append('profileStatus', form.profileStatus || 'active');
 
    (form.disciplines || []).forEach((d, i) => fd.append(`disciplines[${i}]`, d));
    (form.openTo      || []).forEach((o, i) => fd.append(`openTo[${i}]`, o));     // ✅ already correct
 
    if (form.avatarFile) fd.append('profile_picture', form.avatarFile);
    (form.photoFiles  || []).forEach((f, i) => fd.append(`gallery_photos[${i}]`, f));
 
    const result = await dispatch(updateProfile(fd));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Studio profile updated!');
    } else {
      toast.error('Failed to save. Please try again.');
    }
  };

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(d => !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase())),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Studio Profile</h1>
          <p className="text-[#9A9A94] text-sm mt-1">How instructors see your studio on Moving Guru</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-medium text-[#6B6B66] hover:border-[#3E3D38] transition-all"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-50"
          >
            {saving ? <ButtonLoader size={16} /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Preview modal — shows the studio exactly as instructors will see it ── */}
      {preview && (
        <StudioPreviewModal form={form} onClose={() => setPreview(false)} />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">
            <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Studio Info</h2>

            <Field label="Studio Name">
              <input value={form.studioName} onChange={e => update('studioName', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                placeholder="e.g. Flow Studio Bali" />
            </Field>

            <Field label="Contact Name">
              <input value={form.contactName} onChange={e => update('contactName', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                placeholder="Who manages this account?" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City / Location">
                <input value={form.location} onChange={e => update('location', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="e.g. Bali" />
              </Field>
              <Field label="Country">
                <input value={form.country} onChange={e => update('country', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="e.g. Indonesia" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel"
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="+62 ..." />
              </Field>
              <Field label="Website">
                <input value={form.website} onChange={e => update('website', e.target.value)} type="url"
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="https://..." />
              </Field>
            </div>

            <Field label="Instagram">
              <div className="relative">
                <Instagram size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A94]" />
                <input value={form.instagram} onChange={e => update('instagram', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl pl-9 pr-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="@yourstudio" />
              </div>
            </Field>

            <Field label="Studio Size">
              <div className="grid grid-cols-2 gap-2">
                {STUDIO_SIZES.map(sz => (
                  <button key={sz} type="button" onClick={() => update('studioSize', sz)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left
                      ${form.studioSize === sz ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                    {sz}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">
            <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">About the Studio</h2>
            <Field label="Bio">
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={5}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
                placeholder="Describe your studio — the vibe, community, what makes you unique..." />
            </Field>

            <Field label="Open To">
              <div className="flex flex-wrap gap-2">
                {OPEN_TO.map(opt => (
                  <button key={opt} type="button" onClick={() => toggleItem('openTo', opt)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                      ${form.openTo.includes(opt) ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Profile Status">
              <div className="flex gap-3">
                {['active', 'inactive'].map(s => (
                  <button key={s} type="button" onClick={() => update('profileStatus', s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all
                      ${form.profileStatus === s
                        ? s === 'active' ? 'bg-[#6BE6A4]/20 border-[#6BE6A4] text-[#3E3D38]' : 'bg-[#FBF8E4] border-[#9A9A94] text-[#6B6B66]'
                        : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#9A9A94]'}`}>
                    {s === 'active' ? '✓ Actively Hiring' : 'Not Hiring'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Disciplines */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-4">
            <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Disciplines Offered</h2>

            <input type="text" value={disciplineSearch} onChange={e => setDisciplineSearch(e.target.value)}
              placeholder="Search disciplines..."
              className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all" />

            {form.disciplines.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.disciplines.map(d => (
                  <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] rounded-full text-xs font-medium">
                    {d}
                    <button onClick={() => toggleItem('disciplines', d)} className="hover:text-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-56 overflow-y-auto space-y-4">
              {filteredDisciplines.map(cat => (
                <div key={cat.label}>
                  <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase font-semibold mb-2">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map(d => (
                      <button key={d} type="button" onClick={() => toggleItem('disciplines', d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${form.disciplines.includes(d) ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: photos + preview card */}
        <div className="space-y-5">
          {/* Main photo */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Studio Photo</h3>
            <div
              onClick={() => avatarRef.current?.click()}
              className="w-full h-44 border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#2DA4D6] transition-all flex items-center justify-center bg-[#FDFCF8]"
            >
              {form.avatarPreview ? (
                <img src={form.avatarPreview} alt="Studio" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Upload size={24} className="text-[#C4BCB4] mx-auto mb-2" />
                  <p className="text-[#9A9A94] text-xs">Click to upload</p>
                </div>
              )}
            </div>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-4">Gallery (up to 4)</h3>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} onClick={() => photosRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#2DA4D6] transition-all flex items-center justify-center bg-[#FDFCF8]">
                  {form.photos[i] ? (
                    <img src={form.photos[i]} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={16} className="text-[#C4BCB4]" />
                  )}
                </div>
              ))}
            </div>
            <input ref={photosRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          </div>

          {/* Profile card preview */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase font-semibold mb-3">Profile preview</p>
            <div className="bg-[#FDFCF8] rounded-xl p-4 border border-[#E5E0D8]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] overflow-hidden">
                  {form.avatarPreview
                    ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                    : (form.studioName || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[#3E3D38] text-xs font-bold">{form.studioName || 'Your Studio Name'}</p>
                  <p className="text-[#9A9A94] text-[10px]">{form.location || 'Location'}{form.country ? `, ${form.country}` : ''}</p>
                </div>
              </div>
              {form.bio && <p className="text-[#6B6B66] text-[10px] leading-relaxed line-clamp-3">{form.bio}</p>}
              {form.openTo.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.openTo.map(o => (
                    <span key={o} className="px-2 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[9px] rounded-full">{o}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setPreview(true)}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs font-bold text-[#3E3D38] hover:border-[#3E3D38] transition-all"
            >
              <Eye size={12} /> See full preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Studio preview modal — renders the studio exactly as
   instructors will see it on the Find Work / studio listings
   side. Uses the same layout language as the InstructorProfile
   modal so the two halves of the platform look consistent.
   ──────────────────────────────────────────────────────────── */
const OPEN_TO_COLORS = {
  'Direct Hire':     { bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]' },
  'Swaps':           { bg: 'bg-[#E89560]/15', text: 'text-[#E89560]' },
  'Energy Exchange': { bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]' },
};

function StudioPreviewModal({ form, onClose }) {
  const initials = (form.studioName || 'Studio')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isHiring = form.profileStatus === 'active';
  const photos = (form.photos || []).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover + avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="h-32 rounded-t-2xl"
            style={{
              background: 'linear-gradient(135deg, #2DA4D6 0%, #6BE6A4 60%, #f5fca6 100%)'
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label="Close preview"
          >
            <X size={14} className="text-[#3E3D38]" />
          </button>

          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/85 text-[#3E3D38] backdrop-blur-sm">
            Preview
          </span>

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center">
              {form.avatarPreview
                ? <img src={form.avatarPreview} alt={form.studioName} className="w-full h-full object-cover" />
                : <span className="font-['Unbounded'] text-xl font-black text-white">{initials}</span>
              }
            </div>
          </div>
        </div>

        <div className="pt-12 pb-6 px-6">
          {/* Name + status */}
          <div className="text-center mb-4">
            <h2 className="font-['Unbounded'] text-lg font-black text-[#3E3D38]">
              {form.studioName || 'Your Studio Name'}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1 text-[#9A9A94] text-xs">
              {form.contactName && <span>Managed by {form.contactName}</span>}
              {form.studioSize && <span>· {form.studioSize}</span>}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
                ${isHiring ? 'bg-[#6BE6A4]/20 text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#6B6B66]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isHiring ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                {isHiring ? 'Actively Hiring' : 'Not Hiring'}
              </span>
              {form.instagram && (
                <a
                  href={form.instagram.startsWith('http') ? form.instagram : `https://instagram.com/${form.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20"
                >
                  <Instagram size={11} /> {form.instagram}
                </a>
              )}
              {form.website && (
                <a
                  href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#2DA4D6]/10 text-[#2DA4D6] hover:bg-[#2DA4D6]/20"
                >
                  <Globe size={11} /> Website <ExternalLink size={9} />
                </a>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(form.location || form.country) && (
              <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Location</p>
                <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
                  <MapPin size={10} className="text-[#9A9A94]" />
                  {[form.location, form.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {form.studioSize && (
              <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Studio Size</p>
                <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
                  <Building2 size={10} className="text-[#9A9A94]" /> {form.studioSize}
                </p>
              </div>
            )}
            {form.phone && (
              <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Phone</p>
                <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1">
                  <Phone size={10} className="text-[#9A9A94]" /> {form.phone}
                </p>
              </div>
            )}
            {form.openTo.length > 0 && (
              <div className="bg-[#FBF8E4]/60 rounded-xl p-3">
                <p className="text-[8px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">Open To</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {form.openTo.map(o => {
                    const c = OPEN_TO_COLORS[o] || { bg: 'bg-[#FBF8E4]', text: 'text-[#6B6B66]' };
                    return (
                      <span key={o} className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${c.bg} ${c.text}`}>{o}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Disciplines */}
          {form.disciplines.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Disciplines Offered</p>
              <div className="flex flex-wrap gap-1.5">
                {form.disciplines.map(d => (
                  <span key={d} className="px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {form.bio && (
            <div className="mb-4">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">About the Studio</p>
              <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">{form.bio}</p>
            </div>
          )}

          {/* Gallery */}
          {photos.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-bold mb-2">Gallery</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#FBF8E4]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA — disabled in preview but visible so the studio can see them */}
          <div className="flex gap-3 pt-2 border-t border-[#E5E0D8]">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-[#E5E0D8] text-[#9A9A94] bg-[#FDFCF8] cursor-not-allowed"
              title="Preview only"
            >
              <Heart size={15} /> Save
            </button>
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2DA4D6]/60 text-white rounded-xl text-sm font-bold cursor-not-allowed"
              title="Preview only"
            >
              <MessageCircle size={15} /> Send Message
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-5 py-2.5 bg-[#3E3D38] text-white rounded-xl text-sm font-bold hover:bg-[#2a2925] transition-colors"
          >
            Back to editor
          </button>
        </div>
      </div>
    </div>
  );
}