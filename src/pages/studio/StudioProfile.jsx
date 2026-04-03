import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import {
  Upload, X, Building2, MapPin, Globe, Phone,
  Instagram, Save, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

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
    fd.append('_method', 'PATCH');
    fd.append('role', 'studio');
    fd.append('studio_name', form.studioName);
    fd.append('contact_name', form.contactName);
    fd.append('location', form.location);
    fd.append('country', form.country);
    fd.append('phone', form.phone);
    fd.append('website', form.website);
    fd.append('studio_size', form.studioSize);
    fd.append('bio', form.bio);
    fd.append('instagram', form.instagram);
    fd.append('profileStatus', form.profileStatus);
    (form.disciplines || []).forEach((d, i) => fd.append(`disciplines[${i}]`, d));
    (form.openTo || []).forEach((o, i) => fd.append(`openTo[${i}]`, o));
    if (form.avatarFile) fd.append('profile_picture', form.avatarFile);
    (form.photoFiles || []).forEach((f, i) => fd.append(`gallery_photos[${i}]`, f));

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
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${preview ? 'bg-[#3E3D38] border-[#3E3D38] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

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
                        ? s === 'active' ? 'bg-[#6BE6A4]/20 border-[#6BE6A4] text-[#3E3D38]' : 'bg-[#EDE8DF] border-[#9A9A94] text-[#6B6B66]'
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center text-white text-xs font-bold font-['Unbounded']">
                  {(form.studioName || 'S')[0].toUpperCase()}
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
          </div>
        </div>
      </div>
    </div>
  );
}