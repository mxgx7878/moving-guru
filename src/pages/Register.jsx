import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {clearError } from '../store/slices/authSlice';
import { registerUser } from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';
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
const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Italian', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Hindi', 'Korean', 'Indonesian', 'Russian', 'Polish', 'Cantonese', 'Ukrainian', 'Nigerian', 'Thai'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', pronouns: '', studio: '',
    location: '', countryFrom: '', travelingTo: '', availability: '',
    disciplines: [], languages: [],
    openTo: [], profileStatus: 'active',
    bio: '', lookingFor: '', photos: [], avatar: null, avatarPreview: null,
    plan: 'monthly',
  });
  const [errors, setErrors] = useState({});
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const fileRef = useRef();
  const photosRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error: apiError, token } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  useEffect(() => {
    if (token) navigate('/portal/dashboard');
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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
    if (file.size > 4 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Photo must be under 4MB' }));
      return;
    }
    setErrors(prev => ({ ...prev, avatar: null }));
    const url = URL.createObjectURL(file);
    update('avatarPreview', url);
    update('avatar', file);
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const previews = files.map(f => URL.createObjectURL(f));
    update('photoFiles', files);
    update('photos', previews);
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('password', form.password);
    fd.append('age', form.age);
    fd.append('pronouns', form.pronouns);
    fd.append('studio', form.studio);
    fd.append('location', form.location);
    fd.append('countryFrom', form.countryFrom);
    fd.append('travelingTo', form.travelingTo);
    fd.append('availability', form.availability);
    fd.append('profileStatus', form.profileStatus);
    fd.append('bio', form.bio);
    fd.append('lookingFor', form.lookingFor);
    fd.append('plan', form.plan);

    // Arrays
    (form.disciplines || []).forEach((d, i) => fd.append(`disciplines[${i}]`, d));
    (form.languages || []).forEach((l, i) => fd.append(`languages[${i}]`, l));
    (form.openTo || []).forEach((o, i) => fd.append(`openTo[${i}]`, o));

    // Files
    if (form.avatar) fd.append('profile_picture', form.avatar);
    (form.photoFiles || []).forEach((file, i) => fd.append(`gallery_photos[${i}]`, file));

    // Social links (empty array for register)
    fd.append('social_links[]', '');

    dispatch(registerUser(fd));
  };

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(d =>
      !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);


  return (
    <div className="min-h-screen bg-[#FDFCF8] font-['DM_Sans'] py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Globe size={18} className="text-[#CE4F56]" />
            <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
              MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
            </span>
          </Link>
          <Link to="/login" className="text-sm text-[#9A9A94] hover:text-[#3E3D38]">Already a member? Sign in &rarr;</Link>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden">
          {/* Stepper header */}
          <div className="bg-[#CE4F56] px-6 py-5">
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
                        ${done ? 'bg-[#f5fca6] text-[#3E3D38]' : active ? 'bg-white text-[#CE4F56]' : 'bg-white/15 text-white/40'}`}>
                        {done ? <Check size={14} /> : <span className="font-['Unbounded'] text-[10px]">{s.id}</span>}
                      </div>
                      <span className={`text-[9px] tracking-wider uppercase hidden sm:block
                        ${active ? 'text-white' : done ? 'text-[#f5fca6]' : 'text-white/30'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-1 transition-all ${step > s.id ? 'bg-[#f5fca6]' : 'bg-white/15'}`} />
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Create your account</h2>
                  <p className="text-[#9A9A94] text-sm">Start your global wellness journey</p>
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Personal details</h2>
                  <p className="text-[#9A9A94] text-sm">Tell the community about yourself</p>
                </div>

                {/* Avatar upload */}
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed border-[#E5E0D8] flex items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors overflow-hidden bg-[#FDFCF8]"
                      onClick={() => fileRef.current?.click()}
                    >
                      {form.avatarPreview
                        ? <img src={form.avatarPreview} alt="" className="w-full h-full object-cover" />
                        : <Upload size={20} className="text-[#9A9A94]" />
                      }
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="text-sm font-medium text-[#6B6B66] hover:text-[#3E3D38] border border-[#E5E0D8] rounded-lg px-3 py-1.5 hover:border-[#CE4F56] transition-colors"
                      >
                        Upload photo
                      </button>
                      <p className="text-xs text-[#9A9A94] mt-1">JPG, PNG up to 4MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Age" name="age" form={form} update={update} errors={errors} type="number" placeholder="30" />
                  <div>
                    <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Pronouns</label>
                    <select
                      value={form.pronouns}
                      onChange={e => update('pronouns', e.target.value)}
                      className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#CE4F56] bg-white"
                    >
                      <option value="">Select...</option>
                      {PRONOUNS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <Input label="Studio / Workplace (optional)" name="studio" form={form} update={update} errors={errors} placeholder="Studio or gym name" />

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleItem('languages', lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${form.languages.includes(lang)
                            ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                            : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Location & Travel</h2>
                  <p className="text-[#9A9A94] text-sm">Where are you from? Where are you going?</p>
                </div>
                <Input label="Current Location" name="location" form={form} update={update} errors={errors} placeholder="City, Country" />
                <Input label="Country From" name="countryFrom" form={form} update={update} errors={errors} placeholder="e.g. Australia" />
                <Input label="Traveling To" name="travelingTo" form={form} update={update} errors={errors} placeholder="e.g. South America, Italy" />
                <Input label="Availability / Dates" name="availability" form={form} update={update} errors={errors} placeholder="e.g. August – October 2026" />

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Open To</label>
                  <div className="flex flex-wrap gap-2">
                    {OPEN_TO.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleItem('openTo', opt)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                          ${form.openTo.includes(opt)
                            ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]'
                            : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Profile Status</label>
                  <div className="flex gap-3">
                    {['active', 'inactive'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update('profileStatus', s)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all
                          ${form.profileStatus === s
                            ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                            : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#2DA4D6]'
                          }`}
                      >
                        {s === 'active' ? 'Actively Seeking' : 'Not Seeking'}
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Your Disciplines</h2>
                  <p className="text-[#9A9A94] text-sm">Select all that apply — what do you teach or practise?</p>
                </div>

                {/* Selected pills */}
                {form.disciplines.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-[#2DA4D6]/10 rounded-xl border border-[#2DA4D6]/20">
                    {form.disciplines.map(d => (
                      <span key={d} className="flex items-center gap-1 bg-[#2DA4D6] text-white text-xs font-medium px-2.5 py-1 rounded-full">
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
                  className="w-full border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#CE4F56] bg-white"
                />

                {/* Categories */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {filteredDisciplines.map(cat => (
                    <div key={cat.id}>
                      <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
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
                                ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]'
                                : 'border-[#E5E0D8] text-[#3E3D38] hover:border-[#2DA4D6] hover:bg-[#FDFCF8]'
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Bio & Photos</h2>
                  <p className="text-[#9A9A94] text-sm">Let studios and instructors get to know you</p>
                </div>

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                    Bio <span className="text-[#C4BCB4] normal-case">({form.bio.length}/500)</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell the community about yourself, your style, and experience..."
                    className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] resize-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                    What I'm Looking For <span className="text-[#C4BCB4] normal-case">({(form.lookingFor || '').length}/2500)</span>
                  </label>
                  <p className="text-[#C4BCB4] text-xs mb-2">Are you looking for full-time work, short-term swaps, seasonal placements, or something else? Tell studios what you need.</p>
                  <textarea
                    value={form.lookingFor}
                    onChange={e => update('lookingFor', e.target.value)}
                    rows={5}
                    maxLength={2500}
                    placeholder="e.g. I'm looking for a 3-month placement in Europe over summer. Open to studio swaps, direct hire, or energy exchange. Flexible on dates..."
                    className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] resize-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                    Gallery Photos <span className="text-[#C4BCB4] normal-case">(up to 4)</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-[#E5E0D8] rounded-xl p-6 text-center cursor-pointer hover:border-[#2DA4D6] transition-colors"
                    onClick={() => photosRef.current?.click()}
                  >
                    <Upload size={24} className="text-[#9A9A94] mx-auto mb-2" />
                    <p className="text-sm text-[#6B6B66]">Click to upload photos</p>
                    <p className="text-xs text-[#9A9A94] mt-1">JPG, PNG up to 4MB each</p>
                    <input ref={photosRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosChange} />
                  </div>
                  {form.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {form.photos.map((p, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#EDE8DF]">
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
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Choose your plan</h2>
                  <p className="text-[#9A9A94] text-sm">All plans include full access. Cancel anytime.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'monthly', label: 'Monthly', price: '$15', per: '/mo', badge: null },
                    { id: 'biannual', label: '6 Months', price: '$45', per: '/6mo', badge: 'Most Popular', perMonth: '~$7.50/mo' },
                    { id: 'annual', label: '12 Months', price: '$60', per: '/yr', badge: 'Best Value', perMonth: '~$5/mo' },
                  ].map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => update('plan', plan.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                        ${form.plan === plan.id
                          ? 'border-[#2DA4D6] bg-[#2DA4D6] text-white'
                          : 'border-[#E5E0D8] hover:border-[#2DA4D6]/40 text-[#3E3D38]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${form.plan === plan.id ? 'border-white' : 'border-[#E5E0D8]'}`}>
                          {form.plan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{plan.label}</p>
                          {plan.perMonth && <p className={`text-xs ${form.plan === plan.id ? 'text-white/60' : 'text-[#9A9A94]'}`}>{plan.perMonth}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${form.plan === plan.id ? 'bg-white/25 text-white' : 'bg-[#2DA4D6]/10 text-[#2DA4D6]'}`}>
                            {plan.badge}
                          </span>
                        )}
                        <p className="font-['Unbounded'] font-black text-base">{plan.price}<span className="text-xs font-normal opacity-50">{plan.per}</span></p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Welcome promo */}
                <div className="bg-[#f5fca6]/30 border border-[#E5E0D8] rounded-xl p-4">
                  <p className="text-[#CE4F56] text-xs font-bold uppercase tracking-wider mb-2">Launch Offer</p>
                  <p className="text-[#6B6B66] text-xs leading-relaxed">
                    Hey Gurus! To help grow the community and celebrate the launch we&apos;re offering a one off subscription promo of $2 for your first 3 months.
                  </p>
                </div>

                {apiError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-500 text-xs">{apiError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center gap-2 px-5 py-3 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#3E3D38] transition-all"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-[#2DA4D6] text-white font-bold py-4 rounded-xl hover:bg-[#2590bd] transition-all flex items-center justify-center gap-2 font-['Unbounded'] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Complete Registration <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 6 && (
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center gap-2 px-5 py-3 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#3E3D38] transition-all"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2DA4D6] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#2590bd] transition-all"
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
