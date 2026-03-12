import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DISCIPLINE_CATEGORIES } from '../data/disciplines';
import Section from '../components/Section';
import Field from '../components/Field';
import { Save, Upload, X, Check, User, MapPin, Globe, Calendar, Edit3, Eye, EyeOff } from 'lucide-react';

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Italian', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Hindi'];
const OPEN_TO = ['Direct Hire', 'Swaps', 'Both', 'Energy Exchange'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);
  const [discSearch, setDiscSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef();
  const photosRef = useRef();

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-black">Edit Profile</h1>
          <p className="text-black/40 text-sm mt-1">Manage how studios and instructors find you</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-black/15 text-black/60 hover:border-black/30 hover:text-black transition-all"
          >
            {showPreview ? <><EyeOff size={15} /> Hide Preview</> : <><Eye size={15} /> Preview</>}
          </button>
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
      </div>

      {/* Profile Preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
          <div className="px-6 py-4 border-b border-black/6 flex items-center gap-2">
            <Eye size={15} className="text-black/40" />
            <h3 className="font-['Unbounded'] text-xs font-bold text-black tracking-wider uppercase">Profile Preview</h3>
            <span className="text-[10px] text-black/30 ml-auto">This is how others see your profile</span>
          </div>
          <div className="p-6">
            <div className="max-w-md mx-auto">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl overflow-hidden">
                {/* Cover / Avatar area */}
                <div className="relative h-28 bg-gradient-to-r from-[#d4f53c]/30 to-[#e8834a]/30">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4f53c] to-[#e8834a] flex items-center justify-center border-4 border-[#0f0f0f]">
                      {form.avatarPreview
                        ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                        : <span className="font-['Unbounded'] text-xl font-black text-black/70">{initials}</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                  {/* Name & basics */}
                  <h2 className="font-['Unbounded'] text-lg font-black text-white">
                    {form.name || 'Your Name'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {form.age && <span className="text-white/40 text-xs">{form.age} yrs</span>}
                    {form.pronouns && <span className="text-white/40 text-xs">{form.pronouns}</span>}
                  </div>
                  {form.studio && (
                    <p className="text-[#d4f53c] text-xs font-semibold mt-1">{form.studio}</p>
                  )}

                  {/* Status */}
                  <div className="flex justify-center mt-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold
                      ${form.profileStatus === 'active'
                        ? 'bg-[#d4f53c]/20 text-[#d4f53c]'
                        : 'bg-white/10 text-white/40'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.profileStatus === 'active' ? 'bg-[#d4f53c]' : 'bg-white/30'}`} />
                      {form.profileStatus === 'active' ? 'Actively Seeking' : 'Not Seeking'}
                    </span>
                  </div>

                  {/* Bio */}
                  {form.bio && (
                    <p className="text-white/50 text-xs leading-relaxed mt-4 text-left">{form.bio}</p>
                  )}

                  {/* Location info */}
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    {form.location && (
                      <div className="bg-white/5 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">Location</p>
                        <p className="text-white/70 text-xs mt-0.5">{form.location}</p>
                      </div>
                    )}
                    {form.countryFrom && (
                      <div className="bg-white/5 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">From</p>
                        <p className="text-white/70 text-xs mt-0.5">{form.countryFrom}</p>
                      </div>
                    )}
                    {form.travelingTo && (
                      <div className="bg-white/5 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">Traveling To</p>
                        <p className="text-white/70 text-xs mt-0.5">{form.travelingTo}</p>
                      </div>
                    )}
                    {form.availability && (
                      <div className="bg-white/5 rounded-xl p-3 text-left">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider">Available</p>
                        <p className="text-white/70 text-xs mt-0.5">{form.availability}</p>
                      </div>
                    )}
                  </div>

                  {/* Open To */}
                  {(form.openTo || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Open To</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(Array.isArray(form.openTo) ? form.openTo : [form.openTo]).map(o => (
                          <span key={o} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#e8834a]/20 text-[#e8834a]">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disciplines */}
                  {(form.disciplines || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Disciplines</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(form.disciplines || []).map(d => (
                          <span key={d} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#d4f53c]/15 text-[#d4f53c]">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {(form.languages || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Languages</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(form.languages || []).map(l => (
                          <span key={l} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 text-white/60">{l}</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar & Status */}
      <Section title="Profile Identity" icon={User}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center">
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
            <div className="flex gap-2 mt-1 justify-center">
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
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
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
        <div className="flex flex-wrap gap-2 justify-center">
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
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#d4f53c]/15 rounded-xl border border-[#d4f53c]/30 justify-center">
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

        <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
          {filteredCats.map(cat => {
            const allSelected = cat.items.every(d => (form.disciplines || []).includes(d));
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-black/30 tracking-widest uppercase">
                    {cat.emoji} {cat.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(cat.items)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all
                      ${allSelected
                        ? 'bg-black text-[#d4f53c]'
                        : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/60'
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
                          ? 'bg-black border-black text-[#d4f53c]'
                          : 'border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5'
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
        <p className="text-[10px] text-black/30 text-center">Up to 4 gallery photos + 1 main profile photo</p>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-center pb-4">
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
