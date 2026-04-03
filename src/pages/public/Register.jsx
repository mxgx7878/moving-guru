import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../../store/slices/authSlice';
import { registerUser } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { COUNTRIES, COUNTRIES_AND_REGIONS } from '../../data/countries';
import { ROLE_THEME } from '../../config/portalConfig';
import {
  Globe, ArrowRight, ArrowLeft, Check, Upload, X,
  User, MapPin, Dumbbell, FileText, CreditCard, Building2, ChevronDown, Calendar
} from 'lucide-react';
import Input from '../../components/ui/Input';

// ─── Steps ──────────────────────────────────────────────────────
const STEPS_INSTRUCTOR = [
  { id: 1, label: 'Account',     icon: User },
  { id: 2, label: 'Personal',    icon: User },
  { id: 3, label: 'Travel',      icon: MapPin },
  { id: 4, label: 'Disciplines', icon: Dumbbell },
  { id: 5, label: 'Bio & Photos',icon: FileText },
  { id: 6, label: 'Plan',        icon: CreditCard },
];

const STEPS_STUDIO = [
  { id: 1, label: 'Account',     icon: User },
  { id: 2, label: 'Studio',      icon: Building2 },
  { id: 3, label: 'Disciplines', icon: Dumbbell },
  { id: 4, label: 'About',       icon: FileText },
  { id: 5, label: 'Plan',        icon: CreditCard },
];

// ─── Constants ──────────────────────────────────────────────────
const PRONOUNS   = ['He/Him','She/Her','They/Them','He/They','She/They','Prefer not to say'];
const OPEN_TO    = ['Direct Hire','Swaps','Energy Exchange'];
const LANGUAGES  = ['English','Spanish','French','Portuguese','Italian','German','Japanese','Mandarin','Arabic','Hindi','Korean','Indonesian','Russian','Polish','Cantonese','Ukrainian','Nigerian','Thai'];
const STUDIO_OPEN = ['Direct Hire','Swaps','Energy Exchange'];
const STUDIO_SIZES = ['1–5 instructors','6–15 instructors','16–30 instructors','30+ instructors'];
const PLANS = [
  { id:'monthly',  label:'Monthly',   price:15, per:'/mo',  desc:'Flexible, cancel anytime', highlight:false },
  { id:'biannual', label:'6 Months',  price:45, per:'/6mo', desc:'Save 50% vs monthly',      highlight:true  },
  { id:'annual',   label:'12 Months', price:60, per:'/yr',  desc:'Best value — ~$5/mo',      highlight:false },
];

// ─── Helpers ─────────────────────────────────────────────────────
function SelectInput({ label, value, onChange, options, placeholder, error }) {
  return (
    <div>
      {label && <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">{label}</label>}
      <div className="relative">
        <select value={value || ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full appearance-none border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2DA4D6] bg-white pr-10
            ${error ? 'border-red-400' : 'border-[#E5E0D8]'}
            ${!value ? 'text-[#C4BCB4]' : 'text-[#3E3D38]'}`}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function formatDateRange(from, to) {
  if (!from && !to) return '';
  const fmt = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `Until ${fmt(to)}`;
}

// ─── Main ────────────────────────────────────────────────────────
export default function Register() {
  const [role, setRole]   = useState('');
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState({
    name:'', email:'', password:'', confirmPassword:'',
    bio:'', openTo:[], profileStatus:'active',
    plan:'monthly', photos:[], avatar:null, avatarPreview:null, photoFiles:[],
    // instructor
    age:'', pronouns:'', studio:'',
    location:'', countryFrom:'', travelingTo:'',
    availableFrom:'', availableTo:'', flexibleDates:false,
    disciplines:[], languages:[], lookingFor:'',
    // studio
    studioName:'', contactName:'', phone:'', country:'',
    website:'', studioSize:'',
  });
  const [errors, setErrors] = useState({});
  const [discSearch, setDiscSearch] = useState('');
  const fileRef   = useRef();
  const photosRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error: apiError, token, user } = useSelector(s => s.auth);
  const loading = status === STATUS.LOADING;

  useEffect(() => {
    if (token && user) {
      navigate(ROLE_THEME[user.role]?.defaultPath || '/portal/dashboard');
    }
  }, [token, user, navigate]);
  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleItem = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(i => i !== v) : [...f[k], v],
  }));

  const STEPS = role === 'studio' ? STEPS_STUDIO : STEPS_INSTRUCTOR;
  const theme = role === 'studio' ? ROLE_THEME.studio : ROLE_THEME.instructor;
  const accentColor = theme?.accent || '#CE4F56';

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())  e.name = 'Name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (role === 'instructor') {
      if (step === 2 && !form.age) e.age = 'Age is required';
      if (step === 3 && !form.countryFrom) e.countryFrom = 'Please select your country';
      if (step === 3 && !form.availableFrom) e.availableFrom = 'Please select a start date';
      if (step === 4 && !form.disciplines.length) e.disciplines = 'Select at least one discipline';
    }
    if (role === 'studio') {
      if (step === 2 && !form.studioName.trim()) e.studioName = 'Studio name is required';
      if (step === 2 && !form.location.trim())   e.location = 'City is required';
      if (step === 2 && !form.country)           e.country = 'Country is required';
      if (step === 3 && !form.disciplines.length) e.disciplines = 'Select at least one discipline';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);
  const pickRole = (r) => { setRole(r); setStep(1); };

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    update('avatarPreview', URL.createObjectURL(file));
    update('avatar', file);
  };
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    update('photoFiles', files);
    update('photos', files.map(f => URL.createObjectURL(f)));
  };

 const handleSubmit = () => {
    const fd = new FormData();
 
    // Common
    fd.append('role',           role);
    fd.append('name',           form.name);
    fd.append('email',          form.email);
    fd.append('password',       form.password);
    fd.append('bio',            form.bio || '');
    fd.append('profileStatus',  form.profileStatus || 'active');  // ✅ camelCase
    fd.append('plan',           form.plan || 'monthly');
 
    (form.openTo || []).forEach((o, i) =>
      fd.append(`openTo[${i}]`, o)                                // ✅ camelCase
    );
    (form.disciplines || []).forEach((d, i) =>
      fd.append(`disciplines[${i}]`, d)
    );
 
    if (form.avatar)
      fd.append('profile_picture', form.avatar);                  // media — snake_case OK (file field)
    (form.photoFiles || []).forEach((f, i) =>
      fd.append(`gallery_photos[${i}]`, f)
    );
 
    if (role === 'instructor') {
      fd.append('age',           form.age);
      fd.append('pronouns',      form.pronouns || '');
      fd.append('studio',        form.studio || '');
      fd.append('location',      form.location || '');
      fd.append('countryFrom',   form.countryFrom || '');         // ✅ camelCase
      fd.append('travelingTo',   form.travelingTo || '');         // ✅ camelCase
      fd.append('availableFrom', form.availableFrom || '');       // ✅ camelCase
      fd.append('availableTo',   form.availableTo || '');         // ✅ camelCase
      fd.append('availability',  formatDateRange(form.availableFrom, form.availableTo));
      fd.append('flexibleDates', form.flexibleDates ? '1' : '0'); // ✅ camelCase
      fd.append('lookingFor',    form.lookingFor || '');           // ✅ camelCase
      (form.languages || []).forEach((l, i) =>
        fd.append(`languages[${i}]`, l)
      );
    } else {
      // studio
      fd.append('studioName',   form.studioName || '');           // ✅ camelCase
      fd.append('contactName',  form.contactName || form.name);   // ✅ camelCase
      fd.append('location',     form.location || '');
      fd.append('country',      form.country || '');
      fd.append('phone',        form.phone || '');
      fd.append('website',      form.website || '');
      fd.append('studioSize',   form.studioSize || '');           // ✅ camelCase
    }
 
    dispatch(registerUser(fd));
  };

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(d => !discSearch || d.toLowerCase().includes(discSearch.toLowerCase())),
  })).filter(cat => cat.items.length > 0);

  const progress = step > 0 ? ((step - 1) / (STEPS.length - 1)) * 100 : 0;
  const availabilityDisplay = formatDateRange(form.availableFrom, form.availableTo);
  const inp = "w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all";

  // ── STEP 0: Role picker ─────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-['DM_Sans'] p-4">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-10">
            <Globe size={20} className="text-[#CE4F56]" />
            <span className="font-['Unbounded'] text-base font-bold text-[#3E3D38] tracking-wider">
              MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
            </span>
          </div>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] text-center mb-2">Join Moving Guru</h1>
          <p className="text-[#9A9A94] text-sm text-center mb-10">Are you joining as an instructor or a studio?</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => pickRole('instructor')}
              className="group bg-white border-2 border-[#E5E0D8] rounded-2xl p-6 text-left hover:border-[#CE4F56] hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#CE4F56]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE4F56]/20 transition-colors">
                <User size={22} className="text-[#CE4F56]" />
              </div>
              <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">Instructor</p>
              <p className="text-[#9A9A94] text-xs leading-relaxed">I teach wellness disciplines and want to find work globally.</p>
              <div className="flex items-center gap-1 mt-4 text-[#CE4F56] text-xs font-semibold">Join as instructor <ArrowRight size={12} /></div>
            </button>
            <button onClick={() => pickRole('studio')}
              className="group bg-white border-2 border-[#E5E0D8] rounded-2xl p-6 text-left hover:border-[#2DA4D6] hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#2DA4D6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2DA4D6]/20 transition-colors">
                <Building2 size={22} className="text-[#2DA4D6]" />
              </div>
              <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">Studio</p>
              <p className="text-[#9A9A94] text-xs leading-relaxed">I run a wellness studio and want to find travelling instructors.</p>
              <div className="flex items-center gap-1 mt-4 text-[#2DA4D6] text-xs font-semibold">Join as studio <ArrowRight size={12} /></div>
            </button>
          </div>
          <p className="text-center text-[#9A9A94] text-sm mt-8">
            Already a member? <Link to="/login" className="text-[#CE4F56] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 1+: Multi-step form ────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-['DM_Sans'] py-8 px-4">
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Globe size={18} style={{ color: accentColor }} />
          <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
            MOVING <em className="not-italic" style={{ color: accentColor }}>GURU</em>
          </span>
        </Link>
        <button onClick={() => setStep(0)} className="text-xs text-[#9A9A94] hover:text-[#3E3D38] transition-colors">
          ← Change role
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden">

          {/* Stepper header */}
          <div className="px-6 py-5" style={{ backgroundColor: accentColor }}>
            <div className="flex items-center gap-2 mb-5">
              {role === 'studio' ? <Building2 size={16} className="text-white" /> : <User size={16} className="text-white" />}
              <h1 className="font-['Unbounded'] text-base font-black text-white">
                Join as {role === 'studio' ? 'a Studio' : 'an Instructor'}
              </h1>
            </div>
            <div className="flex items-center">
              {STEPS.map((s, i) => {
                const done = step > s.id, active = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                        ${done ? 'bg-[#f5fca6] text-[#3E3D38]' : active ? 'bg-white text-[#3E3D38]' : 'bg-white/15 text-white/40'}`}>
                        {done ? <Check size={14} /> : <span className="font-['Unbounded'] text-[10px] font-bold">{s.id}</span>}
                      </div>
                      <span className={`text-[9px] tracking-wider uppercase hidden sm:block
                        ${active ? 'text-white' : done ? 'text-[#f5fca6]' : 'text-white/30'}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-1 transition-all ${step > s.id ? 'bg-[#f5fca6]' : 'bg-white/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#f5fca6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Step content */}
          <div className="p-6 space-y-5">
            {apiError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-500 text-xs">{apiError}</p>
              </div>
            )}

            {/* ── STEP 1: Account (shared) ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Create your account</h2>
                  <p className="text-[#9A9A94] text-sm">Your Moving Guru login credentials</p>
                </div>
                <Input label="Full Name" name="name" form={form} update={update} errors={errors} placeholder="Your full name" />
                <Input label="Email" name="email" type="email" form={form} update={update} errors={errors} placeholder="you@example.com" />
                <Input label="Password" name="password" type="password" form={form} update={update} errors={errors} placeholder="Min. 6 characters" />
                <Input label="Confirm Password" name="confirmPassword" type="password" form={form} update={update} errors={errors} placeholder="Repeat password" />
              </div>
            )}

            {/* ── STEP 2 INSTRUCTOR: Personal ── */}
            {step === 2 && role === 'instructor' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Personal details</h2>
                  <p className="text-[#9A9A94] text-sm">Tell the community about yourself</p>
                </div>
                {/* Avatar */}
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-full border-2 border-dashed border-[#E5E0D8] flex items-center justify-center cursor-pointer hover:border-[#CE4F56] transition-colors overflow-hidden bg-[#FDFCF8]">
                      {form.avatarPreview ? <img src={form.avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <Upload size={20} className="text-[#C4BCB4]" />}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    <p className="text-[#9A9A94] text-xs">Optional. Recommended square photo.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Age *</label>
                    <input type="number" min="18" max="80" value={form.age} onChange={e => update('age', e.target.value)}
                      placeholder="e.g. 30" className={`${inp} ${errors.age ? 'border-red-400' : ''}`} />
                    {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                  </div>
                  <SelectInput label="Pronouns" value={form.pronouns} onChange={v => update('pronouns', v)} options={PRONOUNS} placeholder="Select pronouns..." />
                </div>
                <Input label="Current Studio / Employer" name="studio" form={form} update={update} errors={errors} placeholder="e.g. STRIVE, Marrickville" />
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l} type="button" onClick={() => toggleItem('languages', l)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${form.languages.includes(l) ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 STUDIO: Studio Info ── */}
            {step === 2 && role === 'studio' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Studio details</h2>
                  <p className="text-[#9A9A94] text-sm">Tell instructors about your studio</p>
                </div>
                <div onClick={() => fileRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-[#E5E0D8] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#2DA4D6] transition-colors overflow-hidden bg-[#FDFCF8]">
                  {form.avatarPreview ? <img src={form.avatarPreview} alt="Studio" className="w-full h-full object-cover" /> :
                    <div className="text-center"><Upload size={20} className="text-[#C4BCB4] mx-auto mb-1" /><p className="text-[#9A9A94] text-xs">Studio main photo (optional)</p></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Studio Name *</label>
                  <input value={form.studioName} onChange={e => update('studioName', e.target.value)}
                    placeholder="e.g. Flow Studio Bali" className={`${inp} ${errors.studioName ? 'border-red-400' : ''}`} />
                  {errors.studioName && <p className="text-red-400 text-xs mt-1">{errors.studioName}</p>}
                </div>
                <Input label="Contact Name" name="contactName" form={form} update={update} errors={errors} placeholder="Who manages this account?" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">City / Location *</label>
                    <input value={form.location} onChange={e => update('location', e.target.value)}
                      placeholder="e.g. Bali" className={`${inp} ${errors.location ? 'border-red-400' : ''}`} />
                    {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                  </div>
                  <SelectInput label="Country *" value={form.country} onChange={v => update('country', v)} options={COUNTRIES} placeholder="Select country..." error={errors.country} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone (optional)" name="phone" form={form} update={update} errors={errors} placeholder="+62 ..." />
                  <Input label="Website (optional)" name="website" form={form} update={update} errors={errors} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Studio Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDIO_SIZES.map(sz => (
                      <button key={sz} type="button" onClick={() => update('studioSize', sz)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left
                          ${form.studioSize === sz ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 INSTRUCTOR: Location & Travel ── */}
            {step === 3 && role === 'instructor' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Location & Travel</h2>
                  <p className="text-[#9A9A94] text-sm">Where are you from? Where are you heading?</p>
                </div>

                <Input label="Current Location" name="location" form={form} update={update} errors={errors} placeholder="City, Country (e.g. Sydney, Australia)" />

                <div className="grid grid-cols-2 gap-4">
                  <SelectInput label="Country From *" value={form.countryFrom} onChange={v => update('countryFrom', v)}
                    options={COUNTRIES} placeholder="Select your country..." error={errors.countryFrom} />
                  <div>
                    <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Traveling To</label>
                    <SelectInput value={form.travelingTo} onChange={v => update('travelingTo', v)}
                      options={COUNTRIES_AND_REGIONS} placeholder="Select destination..." />
                    <input value={form.travelingTo} onChange={e => update('travelingTo', e.target.value)}
                      placeholder="Or type: Italy, Bali, Thailand..."
                      className="mt-2 w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all" />
                  </div>
                </div>

                {/* Availability date range */}
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                    Availability Dates *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#9A9A94] mb-1.5 flex items-center gap-1"><Calendar size={11} /> Available From</p>
                      <input type="date" value={form.availableFrom} onChange={e => update('availableFrom', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`${inp} ${errors.availableFrom ? 'border-red-400' : ''}`} />
                      {errors.availableFrom && <p className="text-red-400 text-xs mt-1">{errors.availableFrom}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-[#9A9A94] mb-1.5 flex items-center gap-1"><Calendar size={11} /> Available To</p>
                      <input type="date" value={form.availableTo} onChange={e => update('availableTo', e.target.value)}
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
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={form.flexibleDates} onChange={e => update('flexibleDates', e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5E0D8] accent-[#2DA4D6]" />
                    <span className="text-sm text-[#6B6B66]">I'm flexible with exact dates</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Open To</label>
                  <div className="flex flex-wrap gap-2">
                    {OPEN_TO.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('openTo', opt)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                          ${form.openTo.includes(opt) ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── DISCIPLINES (Step 3 studio / Step 4 instructor) ── */}
            {((step === 3 && role === 'studio') || (step === 4 && role === 'instructor')) && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">
                    {role === 'studio' ? 'Disciplines offered' : 'Your disciplines'}
                  </h2>
                  <p className="text-[#9A9A94] text-sm">{role === 'studio' ? 'What does your studio teach?' : 'What do you teach?'}</p>
                </div>
                <input type="text" value={discSearch} onChange={e => setDiscSearch(e.target.value)}
                  placeholder="Search disciplines..."
                  className={inp} />
                {form.disciplines.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.disciplines.map(d => (
                      <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] rounded-full text-xs font-medium">
                        {d}<button onClick={() => toggleItem('disciplines', d)} className="hover:text-red-500"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.disciplines && <p className="text-red-400 text-xs">{errors.disciplines}</p>}
                <div className="max-h-64 overflow-y-auto space-y-4 pr-1 border border-[#E5E0D8] rounded-xl p-3">
                  {filteredDisciplines.map(cat => (
                    <div key={cat.label}>
                      <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase font-semibold mb-2">{cat.emoji} {cat.label}</p>
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
            )}

            {/* ── STEP 5 INSTRUCTOR: Bio & Photos ── */}
            {step === 5 && role === 'instructor' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Bio & Photos</h2>
                  <p className="text-[#9A9A94] text-sm">Help studios understand what makes you special</p>
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-1.5">About You</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4}
                    placeholder="Tell studios about your experience, teaching style, and what you're looking for..."
                    className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-1.5">What I'm Looking For</label>
                  <textarea value={form.lookingFor} onChange={e => update('lookingFor', e.target.value)} rows={3}
                    placeholder="Describe your ideal opportunity..."
                    className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Gallery Photos (up to 4, optional)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} onClick={() => photosRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#CE4F56] transition-all flex items-center justify-center bg-[#FDFCF8]">
                        {form.photos[i] ? <img src={form.photos[i]} alt="" className="w-full h-full object-cover" /> : <Upload size={16} className="text-[#C4BCB4]" />}
                      </div>
                    ))}
                  </div>
                  <input ref={photosRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                </div>
              </div>
            )}

            {/* ── STEP 4 STUDIO: About ── */}
            {step === 4 && role === 'studio' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">About your studio</h2>
                  <p className="text-[#9A9A94] text-sm">Help instructors understand your studio</p>
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-1.5">About the Studio</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={4}
                    placeholder="Describe your studio — the vibe, community, what makes you unique..."
                    className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Open To</label>
                  <div className="flex flex-wrap gap-2">
                    {STUDIO_OPEN.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('openTo', opt)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                          ${form.openTo.includes(opt) ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">Gallery Photos (up to 4, optional)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} onClick={() => photosRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#2DA4D6] transition-all flex items-center justify-center bg-[#FDFCF8]">
                        {form.photos[i] ? <img src={form.photos[i]} alt="" className="w-full h-full object-cover" /> : <Upload size={16} className="text-[#C4BCB4]" />}
                      </div>
                    ))}
                  </div>
                  <input ref={photosRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                </div>
              </div>
            )}

            {/* ── LAST STEP: Plan ── */}
            {((step === 6 && role === 'instructor') || (step === 5 && role === 'studio')) && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-1">Choose your plan</h2>
                  <p className="text-[#9A9A94] text-sm">Join the Moving Guru global network</p>
                </div>
                <div className="space-y-3">
                  {PLANS.map(plan => (
                    <button key={plan.id} type="button" onClick={() => update('plan', plan.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all relative
                        ${form.plan === plan.id ? 'border-[#2DA4D6] bg-[#2DA4D6]/5' : 'border-[#E5E0D8] hover:border-[#2DA4D6]/40'}`}>
                      {plan.highlight && (
                        <span className="absolute top-3 right-3 bg-[#f5fca6] text-[#3E3D38] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${form.plan === plan.id ? 'border-[#2DA4D6]' : 'border-[#C4BCB4]'}`}>
                          {form.plan === plan.id && <div className="w-2 h-2 rounded-full bg-[#2DA4D6]" />}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-['Unbounded'] text-base font-black text-[#3E3D38]">${plan.price}</span>
                            <span className="text-[#9A9A94] text-xs">{plan.per}</span>
                          </div>
                          <p className="text-[#6B6B66] text-xs mt-0.5">{plan.label} — {plan.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bg-[#f5fca6]/30 rounded-xl p-4 border border-[#f5fca6]">
                  <p className="text-[#3E3D38] text-xs font-semibold mb-1">🎉 Launch Promo Active</p>
                  <p className="text-[#6B6B66] text-xs">First 3 months for $2. First 100 studios get 6 months free. Founding member pricing locked in forever.</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            {step > 1 ? (
              <button type="button" onClick={prev}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E0D8] text-[#6B6B66] rounded-xl text-sm font-medium hover:border-[#9A9A94] transition-all">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <button type="button" onClick={() => setStep(0)} className="text-sm text-[#9A9A94] hover:text-[#3E3D38] transition-colors">
                ← Change role
              </button>
            )}
            {step < STEPS.length ? (
              <button type="button" onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: accentColor }}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: accentColor }}>
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>{role === 'studio' ? 'Create Studio Account' : 'Create Account'} <ArrowRight size={16} /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[#9A9A94] text-xs mt-6">
          Already a member? <Link to="/login" className="text-[#CE4F56] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}