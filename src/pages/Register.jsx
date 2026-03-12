import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DISCIPLINE_CATEGORIES } from '../data/disciplines';
import {
  Globe, ArrowRight, ArrowLeft, Check, Upload, X,
  Plus, User, MapPin, Dumbbell, FileText, CreditCard
} from 'lucide-react';
import Input from '../components/Input';

const STEPS = [
  { id: 1, label: 'Account', icon: User },
  { id: 2, label: 'Personal', icon: User },
  { id: 3, label: 'Location', icon: MapPin },
  { id: 4, label: 'Disciplines', icon: Dumbbell },
  { id: 5, label: 'Bio & Photos', icon: FileText },
  { id: 6, label: 'Plan', icon: CreditCard },
];

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];
const OPEN_TO = ['Direct Hire', 'Swaps', 'Both', 'Energy Exchange'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Italian', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Hindi'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', pronouns: '', studio: '',
    location: '', countryFrom: '', travelingTo: '', availability: '',
    disciplines: [], languages: [],
    openTo: [], profileStatus: 'active',
    bio: '', photos: [], avatar: null, avatarPreview: null,
    plan: 'monthly',
  });
  const [errors, setErrors] = useState({});
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const fileRef = useRef();
  const photosRef = useRef();
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleItem = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(i => i !== val) : [...f[key], val]
    }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 2) {
      if (!form.age) e.age = 'Age is required';
    }
    if (step === 3) {
      if (!form.location.trim()) e.location = 'Location is required';
      if (!form.countryFrom.trim()) e.countryFrom = 'Country is required';
    }
    if (step === 4) {
      if (form.disciplines.length === 0) e.disciplines = 'Select at least one discipline';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update('avatarPreview', url);
    update('avatar', file);
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const previews = files.map(f => URL.createObjectURL(f));
    update('photos', previews);
  };

  const handleSubmit = () => {
    const result = register(form);
    if (result.success) navigate('/portal/dashboard');
  };

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(d =>
      !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);


  return (
    <div className="min-h-screen bg-[#f0f5d8] font-['DM_Sans'] py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Globe size={18} className="text-black/60" />
            <span className="font-['Unbounded'] text-sm font-bold text-black/70 tracking-wider">
              MOVING <em className="not-italic text-black">GURU</em>
            </span>
          </Link>
          <Link to="/login" className="text-sm text-black/40 hover:text-black/70">Already a member? Sign in →</Link>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-black/8 overflow-hidden">
          {/* Stepper header */}
          <div className="bg-[#0f0f0f] px-6 py-5">
            <h1 className="font-['Unbounded'] text-lg font-black text-white mb-5">
              Join Moving Guru
            </h1>
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${done ? 'bg-[#d4f53c] text-black' : active ? 'bg-[#d4f53c] text-black' : 'bg-white/10 text-white/30'}`}>
                        {done ? <Check size={14} /> : <span className="font-['Unbounded'] text-[10px]">{s.id}</span>}
                      </div>
                      <span className={`text-[9px] tracking-wider uppercase hidden sm:block
                        ${active || done ? 'text-[#d4f53c]' : 'text-white/20'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-1 transition-all ${step > s.id ? 'bg-[#d4f53c]' : 'bg-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="p-6 lg:p-8">

            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Create your account</h2>
                  <p className="text-black/40 text-sm">Start your global wellness journey</p>
                </div>
                <Input label="Full Name" name="name" form={form} update={update} errors={errors} placeholder="Your full name" />
                <Input label="Email" name="email" type="email" form={form} update={update} errors={errors} placeholder="you@example.com" />
                <Input label="Password" name="password" type="password" form={form} update={update} errors={errors} placeholder="Min. 6 characters" />
                <Input label="Confirm Password" name="confirmPassword" type="password" form={form} update={update} errors={errors} placeholder="Repeat password" />
              </div>
            )}

            {/* Step 2: Personal */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Personal details</h2>
                  <p className="text-black/40 text-sm">Tell the community about yourself</p>
                </div>

                {/* Avatar upload */}
                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-black/40 transition-colors overflow-hidden bg-black/5"
                      onClick={() => fileRef.current?.click()}
                    >
                      {form.avatarPreview
                        ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                        : <Upload size={20} className="text-black/30" />
                      }
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="text-sm font-medium text-black/70 hover:text-black border border-black/20 rounded-lg px-3 py-1.5 hover:border-black/40 transition-colors"
                      >
                        Upload photo
                      </button>
                      <p className="text-xs text-black/30 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Age" name="age" form={form} update={update} errors={errors} type="number" placeholder="30" />
                  <div>
                    <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">Pronouns</label>
                    <select
                      value={form.pronouns}
                      onChange={e => update('pronouns', e.target.value)}
                      className="w-full border border-black/15 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/40 bg-white"
                    >
                      <option value="">Select...</option>
                      {PRONOUNS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <Input label="Studio / Workplace (optional)" name="studio" form={form} update={update} errors={errors} placeholder="Studio or gym name" />

                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleItem('languages', lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${form.languages.includes(lang)
                            ? 'bg-[#d4f53c] border-[#d4f53c] text-black'
                            : 'border-black/15 text-black/50 hover:border-black/30'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Travel */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Location & Travel</h2>
                  <p className="text-black/40 text-sm">Where are you from? Where are you going?</p>
                </div>
                <Input label="Current Location" name="location" form={form} update={update} errors={errors} placeholder="City, Country" />
                <Input label="Country From" name="countryFrom" form={form} update={update} errors={errors} placeholder="e.g. Australia" />
                <Input label="Traveling To" name="travelingTo" form={form} update={update} errors={errors} placeholder="e.g. South America, Italy" />
                <Input label="Availability / Dates" name="availability" form={form} update={update} errors={errors} placeholder="e.g. August – October 2026" />

                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">Open To</label>
                  <div className="flex flex-wrap gap-2">
                    {OPEN_TO.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleItem('openTo', opt)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                          ${form.openTo.includes(opt)
                            ? 'bg-black text-[#d4f53c] border-black'
                            : 'border-black/15 text-black/50 hover:border-black/30'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">Profile Status</label>
                  <div className="flex gap-3">
                    {['active', 'inactive'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update('profileStatus', s)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all
                          ${form.profileStatus === s
                            ? 'bg-[#d4f53c] border-[#d4f53c] text-black'
                            : 'border-black/15 text-black/40 hover:border-black/30'
                          }`}
                      >
                        {s === 'active' ? '🟢 Actively Seeking' : '⚪ Not Seeking'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Disciplines */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Your Disciplines</h2>
                  <p className="text-black/40 text-sm">Select all that apply — what do you teach or practise?</p>
                </div>

                {/* Selected pills */}
                {form.disciplines.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-[#d4f53c]/20 rounded-xl border border-[#d4f53c]/30">
                    {form.disciplines.map(d => (
                      <span key={d} className="flex items-center gap-1 bg-[#d4f53c] text-black text-xs font-medium px-2.5 py-1 rounded-full">
                        {d}
                        <button onClick={() => toggleItem('disciplines', d)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.disciplines && <p className="text-red-500 text-xs">{errors.disciplines}</p>}

                {/* Search */}
                <input
                  type="text"
                  value={disciplineSearch}
                  onChange={e => setDisciplineSearch(e.target.value)}
                  placeholder="Search disciplines..."
                  className="w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/40 bg-white"
                />

                {/* Categories */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {filteredDisciplines.map(cat => (
                    <div key={cat.id}>
                      <p className="text-[10px] font-bold text-black/40 tracking-widest uppercase mb-2">
                        {cat.emoji} {cat.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleItem('disciplines', d)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                              ${form.disciplines.includes(d)
                                ? 'bg-black text-[#d4f53c] border-black'
                                : 'border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5'
                              }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Bio & Photos */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Bio & Photos</h2>
                  <p className="text-black/40 text-sm">Let studios and instructors get to know you</p>
                </div>

                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">
                    Bio <span className="text-black/20 normal-case">({form.bio.length}/500)</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="Tell the community about yourself, your style, experience and what you're looking for..."
                    className="w-full border border-black/15 rounded-xl px-4 py-3 text-sm text-black placeholder-black/30 focus:outline-none focus:border-black/40 resize-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">
                    Gallery Photos <span className="text-black/20 normal-case">(up to 4)</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-black/15 rounded-xl p-6 text-center cursor-pointer hover:border-black/30 transition-colors"
                    onClick={() => photosRef.current?.click()}
                  >
                    <Upload size={24} className="text-black/30 mx-auto mb-2" />
                    <p className="text-sm text-black/40">Click to upload photos</p>
                    <p className="text-xs text-black/25 mt-1">JPG, PNG up to 5MB each</p>
                    <input ref={photosRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosChange} />
                  </div>
                  {form.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {form.photos.map((p, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-black/5">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Plan */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-black mb-1">Choose your plan</h2>
                  <p className="text-black/40 text-sm">All plans include full access. Cancel anytime.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'monthly', label: 'Monthly', price: '$15', per: '/mo', badge: null },
                    { id: 'biannual', label: '6 Months', price: '$45', per: '/6mo', badge: 'Save 50%', perMonth: '~$7.50/mo' },
                    { id: 'annual', label: '12 Months', price: '$60', per: '/yr', badge: 'Best Value', perMonth: '~$5/mo' },
                  ].map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => update('plan', plan.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                        ${form.plan === plan.id
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 hover:border-black/30 text-black'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${form.plan === plan.id ? 'border-[#d4f53c]' : 'border-current opacity-30'}`}>
                          {form.plan === plan.id && <div className="w-2 h-2 rounded-full bg-[#d4f53c]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{plan.label}</p>
                          {plan.perMonth && <p className={`text-xs ${form.plan === plan.id ? 'text-white/50' : 'text-black/40'}`}>{plan.perMonth}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${form.plan === plan.id ? 'bg-[#d4f53c] text-black' : 'bg-[#d4f53c]/20 text-black'}`}>
                            {plan.badge}
                          </span>
                        )}
                        <p className="font-['Unbounded'] font-black text-base">{plan.price}<span className="text-xs font-normal opacity-50">{plan.per}</span></p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Launch promo */}
                <div className="bg-[#e8834a]/10 border border-[#e8834a]/20 rounded-xl p-4">
                  <p className="text-[#e8834a] text-xs font-bold uppercase tracking-wider mb-2">🎉 Launch Promo</p>
                  <p className="text-black/60 text-xs leading-relaxed">
                    First 20,000 founding members get 3 months for just $2. Join during launch month to lock in this offer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-black text-[#d4f53c] font-bold py-4 rounded-xl hover:bg-black/90 transition-all flex items-center justify-center gap-2 font-['Unbounded'] text-sm"
                >
                  Complete Registration <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 6 && (
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center gap-2 px-5 py-3 border border-black/15 rounded-xl text-sm font-medium text-black/60 hover:border-black/30 hover:text-black transition-all"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-[#d4f53c] font-bold text-sm py-3 rounded-xl hover:bg-black/90 transition-all"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
