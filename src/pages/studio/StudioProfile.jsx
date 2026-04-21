import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import {
  Upload, X, Instagram, Save, Eye,
  Briefcase, Calendar, GraduationCap, Clock, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoader } from '../../components/feedback';
import { StudioPreviewModal } from '../../features/modals';

const OPEN_TO = ['Direct Hire', 'Swaps', 'Energy Exchange'];
const STUDIO_SIZES = ['1–5 instructors', '6–15 instructors', '16–30 instructors', '30+ instructors'];

// ── Position types match the JobListings form so the same vocabulary
//    is used everywhere a studio describes who they're hiring.
const POSITION_TYPES = [
  { id: 'permanent',     label: 'Permanent'                   },
  { id: 'temporary',     label: 'Temporary'                   },
  { id: 'substitute',    label: 'Substitute'                  },
  { id: 'weekend_cover', label: 'Substitute for the weekend'  },
  { id: 'casual',        label: 'Casual / On-call'            },
];

const POSITION_LABELS = POSITION_TYPES.reduce((acc, p) => ({ ...acc, [p.id]: p.label }), {});

// ── Qualification levels — ordered roughly low → high.
//    Used by both Studio Profile (active hiring box) and JobListings,
//    so any change here propagates to the whole app + the DB enum.
export const QUALIFICATION_LEVELS = [
  { id: 'none',                  label: 'Not required'                          },
  { id: 'intermediate',          label: 'Intermediate / High School'            },
  { id: 'diploma',               label: 'Diploma / Associate'                   },
  { id: 'bachelors',             label: "Bachelor's Degree"                     },
  { id: 'masters',               label: "Master's Degree"                       },
  { id: 'doctorate',             label: 'Doctorate / PhD'                       },
  { id: 'cert_200hr',            label: '200hr Teacher Certification'           },
  { id: 'cert_500hr',            label: '500hr Teacher Certification'           },
  { id: 'cert_comprehensive',    label: 'Comprehensive Certification'           },
  { id: 'cert_specialized',      label: 'Specialised / Other Certification'     },
];

const QUALIFICATION_LABELS = QUALIFICATION_LEVELS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q.label }), {}
);

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
    // ── Active hiring details (only relevant when profileStatus === 'active')
    hiringRoleDescription:    user?.hiring_role_description    || user?.hiringRoleDescription    || '',
    hiringPositionType:       user?.hiring_position_type       || user?.hiringPositionType       || 'permanent',
    hiringStartDate:          user?.hiring_start_date          || user?.hiringStartDate          || '',
    hiringQualificationLevel: user?.hiring_qualification_level || user?.hiringQualificationLevel || 'none',
    hiringCompensation:       user?.hiring_compensation        || user?.hiringCompensation       || '',
    hiringDuration:           user?.hiring_duration            || user?.hiringDuration           || '',
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
    // When the studio is actively hiring, the role description is required.
    if (form.profileStatus === 'active' && !form.hiringRoleDescription.trim()) {
      toast.error('Please describe the role you’re hiring for, or switch to Not Hiring.');
      return;
    }

    const fd = new FormData();

    fd.append('studioName',    form.studioName   || '');
    fd.append('contactName',   form.contactName  || '');
    fd.append('location',      form.location     || '');
    fd.append('country',       form.country      || '');
    fd.append('phone',         form.phone        || '');
    fd.append('website',       form.website      || '');
    fd.append('studioSize',    form.studioSize   || '');
    fd.append('bio',           form.bio          || '');
    fd.append('instagram',     form.instagram    || '');
    fd.append('profileStatus', form.profileStatus || 'active');

    (form.disciplines || []).forEach((d, i) => fd.append(`disciplines[${i}]`, d));
    (form.openTo      || []).forEach((o, i) => fd.append(`openTo[${i}]`, o));

    if (form.avatarFile) fd.append('profile_picture', form.avatarFile);
    (form.photoFiles  || []).forEach((f, i) => fd.append(`gallery_photos[${i}]`, f));

    // ── Active hiring details ──────────────────────────────────────
    // Always send the keys so toggling Not Hiring → server can clear them.
    // Backend should accept both snake_case and camelCase; we send snake_case.
    const isHiring = form.profileStatus === 'active';
    fd.append('hiring_role_description',    isHiring ? (form.hiringRoleDescription || '') : '');
    fd.append('hiring_position_type',       isHiring ? (form.hiringPositionType    || '') : '');
    fd.append('hiring_start_date',          isHiring ? (form.hiringStartDate       || '') : '');
    fd.append('hiring_qualification_level', isHiring ? (form.hiringQualificationLevel || 'none') : 'none');
    fd.append('hiring_compensation',        isHiring ? (form.hiringCompensation    || '') : '');
    fd.append('hiring_duration',            isHiring ? (form.hiringDuration        || '') : '');

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
        <StudioPreviewModal
          form={form}
          positionLabels={POSITION_LABELS}
          qualificationLabels={QUALIFICATION_LABELS}
          onClose={() => setPreview(false)}
        />
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

            {/* ── Active hiring details ──
                Per the client's request: when the studio toggles "Actively
                Hiring" on, surface a box where they can describe the role
                in detail (start date, position type, qualification, etc).
                Hidden when "Not Hiring" so the form stays tidy. */}
            {form.profileStatus === 'active' && (
              <div className="rounded-2xl border border-[#6BE6A4] bg-[#6BE6A4]/10 p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#6BE6A4]/30 flex items-center justify-center">
                    <Briefcase size={16} className="text-[#3E3D38]" />
                  </div>
                  <div>
                    <h3 className="font-['Unbounded'] text-xs font-black text-[#3E3D38]">Active Hiring Details</h3>
                    <p className="text-[10px] text-[#3E3D38]/70">
                      Tell instructors about the role you're hiring for
                    </p>
                  </div>
                </div>

                <Field label="Role Description *">
                  <textarea
                    value={form.hiringRoleDescription}
                    onChange={e => update('hiringRoleDescription', e.target.value)}
                    rows={4}
                    placeholder='Please give us much detail as possible — e.g. "Looking for a Vinyasa Yoga instructor to cover Saturday & Sunday morning classes for the next 4 weekends. Must be confident with mixed-level groups and able to start immediately."'
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
                  />
                </Field>

                <Field label="Position Type">
                  <div className="flex flex-wrap gap-2">
                    {POSITION_TYPES.map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => update('hiringPositionType', o.id)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all
                          ${form.hiringPositionType === o.id
                            ? 'bg-[#CCFF00] text-[#3E3D38] border-[#CCFF00]'
                            : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <div className="relative">
                      <Calendar size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                      <input
                        type="date"
                        value={form.hiringStartDate}
                        onChange={e => update('hiringStartDate', e.target.value)}
                        className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                      />
                    </div>
                  </Field>
                  <Field label="Duration (optional)">
                    <div className="relative">
                      <Clock size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                      <input
                        value={form.hiringDuration}
                        onChange={e => update('hiringDuration', e.target.value)}
                        placeholder="e.g. 4 weekends, 3 months, ongoing"
                        className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Compensation (optional)">
                  <input
                    value={form.hiringCompensation}
                    onChange={e => update('hiringCompensation', e.target.value)}
                    placeholder="e.g. $50/class, $800/week, energy exchange + accommodation"
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </Field>

                <Field label="Minimum Qualification">
                  <div className="relative">
                    <GraduationCap size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2DA4D6] pointer-events-none" />
                    <select
                      value={form.hiringQualificationLevel}
                      onChange={e => update('hiringQualificationLevel', e.target.value)}
                      className="w-full appearance-none bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-10 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                    >
                      {QUALIFICATION_LEVELS.map(q => (
                        <option key={q.id} value={q.id}>{q.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-[#3E3D38]/70 mt-1.5">
                    Pick "Not required" if any background is welcome.
                  </p>
                </Field>
              </div>
            )}
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