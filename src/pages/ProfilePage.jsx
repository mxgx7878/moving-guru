import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DISCIPLINE_CATEGORIES } from '../data/disciplines';
import { Save, Upload, X, Check, User, MapPin, Globe, Calendar, Edit3 } from 'lucide-react';

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Italian', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Hindi'];
const OPEN_TO = ['Direct Hire', 'Swaps', 'Both', 'Energy Exchange'];

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
      <div className="px-6 py-4 border-b border-black/6 flex items-center gap-2">
        <Icon size={15} className="text-black/40" />
        <h3 className="font-['Unbounded'] text-xs font-bold text-black tracking-wider uppercase">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-black/40 tracking-widest uppercase mb-2">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-black/25 mt-1">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const [discSearch, setDiscSearch] = useState('');
  const fileRef = useRef();
  const photosRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key]?.includes(val) ? f[key].filter(i => i !== val) : [...(f[key] || []), val]
    }));
  };

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

  const filteredCats = DISCIPLINE_CATEGORIES.map(c => ({
    ...c,
    items: c.items.filter(d => !discSearch || d.toLowerCase().includes(discSearch.toLowerCase()))
  })).filter(c => c.items.length > 0);

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'MG';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-black">Edit Profile</h1>
          <p className="text-black/40 text-sm mt-1">Manage how studios and instructors find you</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
            ${saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#d4f53c] text-black hover:bg-[#c4e530]'
            }`}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      {/* Avatar & Status */}
      <Section title="Profile Identity" icon={User}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4f53c] to-[#e8834a] flex items-center justify-center cursor-pointer relative group"
              onClick={() => fileRef.current?.click()}
            >
              {form.avatarPreview
                ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                : <span className="font-['Unbounded'] text-2xl font-black text-black/70">{initials}</span>
              }
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <p className="text-[10px] text-black/30 text-center mt-2">Click to change</p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input value={form.name || ''} onChange={e => set('name', e.target.value)}
                  className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
              </Field>
              <Field label="Age">
                <input type="number" value={form.age || ''} onChange={e => set('age', e.target.value)}
                  className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pronouns">
                <select value={form.pronouns || ''} onChange={e => set('pronouns', e.target.value)}
                  className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white">
                  <option value="">Select...</option>
                  {PRONOUNS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Studio / Workplace">
                <input value={form.studio || ''} onChange={e => set('studio', e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
              </Field>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <div className="mt-5 pt-5 border-t border-black/6">
          <Field label="Profile Status" hint="Active profiles appear in search results">
            <div className="flex gap-2 mt-1">
              {['active', 'inactive'].map(s => (
                <button key={s} type="button" onClick={() => set('profileStatus', s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === s
                      ? s === 'active' ? 'bg-[#d4f53c] border-[#d4f53c] text-black' : 'bg-black border-black text-white'
                      : 'border-black/15 text-black/40 hover:border-black/30'
                    }`}>
                  <span className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-500' : 'bg-black/20'}`} />
                  {s === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                </button>
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
            className="w-full border border-black/15 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-black/30 bg-white" />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location & Travel" icon={MapPin}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current Location">
              <input value={form.location || ''} onChange={e => set('location', e.target.value)}
                placeholder="City, Country"
                className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
            </Field>
            <Field label="Country From">
              <input value={form.countryFrom || ''} onChange={e => set('countryFrom', e.target.value)}
                placeholder="e.g. Australia"
                className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Traveling To">
              <input value={form.travelingTo || ''} onChange={e => set('travelingTo', e.target.value)}
                placeholder="e.g. South America, Italy"
                className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
            </Field>
            <Field label="Availability">
              <input value={form.availability || ''} onChange={e => set('availability', e.target.value)}
                placeholder="e.g. Aug – Oct 2026"
                className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white" />
            </Field>
          </div>

          <Field label="Open To">
            <div className="flex flex-wrap gap-2 mt-1">
              {OPEN_TO.map(opt => (
                <button key={opt} type="button" onClick={() => toggle('openTo', opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${(form.openTo || []).includes(opt)
                      ? 'bg-black border-black text-[#d4f53c]'
                      : 'border-black/15 text-black/50 hover:border-black/30'
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
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang} type="button" onClick={() => toggle('languages', lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${(form.languages || []).includes(lang)
                  ? 'bg-[#d4f53c] border-[#d4f53c] text-black'
                  : 'border-black/15 text-black/50 hover:border-black/30'
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
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#d4f53c]/15 rounded-xl border border-[#d4f53c]/30">
            {(form.disciplines || []).map(d => (
              <span key={d} className="flex items-center gap-1 bg-[#d4f53c] text-black text-xs font-medium px-2.5 py-1 rounded-full">
                {d}
                <button type="button" onClick={() => toggle('disciplines', d)}><X size={9} /></button>
              </span>
            ))}
          </div>
        )}

        <input type="text" value={discSearch} onChange={e => setDiscSearch(e.target.value)}
          placeholder="Search disciplines..."
          className="w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/30 bg-white mb-4" />

        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {filteredCats.map(cat => (
            <div key={cat.id}>
              <p className="text-[9px] font-bold text-black/30 tracking-widest uppercase mb-2">
                {cat.emoji} {cat.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(d => (
                  <button key={d} type="button" onClick={() => toggle('disciplines', d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${(form.disciplines || []).includes(d)
                        ? 'bg-black border-black text-[#d4f53c]'
                        : 'border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5'
                      }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Photos */}
      <Section title="Gallery Photos" icon={Upload}>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {(form.photos || []).map((p, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-black/5 relative group">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          {(form.photos || []).length < 4 && (
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors"
              onClick={() => photosRef.current?.click()}
            >
              <Upload size={18} className="text-black/25" />
              <p className="text-[10px] text-black/25 mt-1">Add</p>
            </div>
          )}
        </div>
        <input ref={photosRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
        <p className="text-[10px] text-black/30">Up to 4 gallery photos + 1 main profile photo</p>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300
            ${saved ? 'bg-emerald-500 text-white' : 'bg-[#d4f53c] text-black hover:bg-[#c4e530]'}`}
        >
          {saved ? <><Check size={15} /> Changes Saved!</> : <><Save size={15} /> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}
