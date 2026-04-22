import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import {
  Upload, X, Instagram, Save, Eye,
  Briefcase, Calendar, GraduationCap, Clock, ChevronDown, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { ButtonLoader } from '../../components/feedback';
import { Field } from '../../components/ui';
import { StudioPreviewModal } from '../../features/modals';
import { ReviewList } from '../../features/reviews';

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
    // Backend accepts both snake_case and camelCase; we send snake_case.
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

  const initials = (form.studioName || user?.name || 'Studio')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Studio Profile</h1>
        <p className="text-[#9A9A94] text-sm mt-1">How instructors see your studio on Moving Guru</p>
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

      {/* ══════════════════════════════════════
           2-COLUMN LAYOUT
         ══════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ─────── LEFT COLUMN — Form cards ─────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">
            <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Studio Info</h2>

            <Field label="Studio Name">
              <input value={form.studioName} onChange={e => update('studioName', e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                placeholder="e.g. Zen Flow Studio" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact Name">
                <input value={form.contactName} onChange={e => update('contactName', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="e.g. Sarah Mitchell" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="+1 234 567 8900" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City / Location">
                <input value={form.location} onChange={e => update('location', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="e.g. Sydney" />
              </Field>
              <Field label="Country">
                <input value={form.country} onChange={e => update('country', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="e.g. Australia" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Website">
                <input value={form.website} onChange={e => update('website', e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  placeholder="https://yourstudio.com" />
              </Field>
              <Field label="Instagram">
                <div className="relative">
                  <Instagram size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94]" />
                  <input value={form.instagram} onChange={e => update('instagram', e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl pl-9 pr-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                    placeholder="@yourstudio" />
                </div>
              </Field>
            </div>

            <Field label="Studio Size">
              <div className="flex flex-wrap gap-2">
                {STUDIO_SIZES.map(sz => (
                  <button key={sz} type="button" onClick={() => update('studioSize', sz)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all
                      ${form.studioSize === sz
                        ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                        : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
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
                      ${form.openTo.includes(opt)
                        ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]'
                        : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </Field>

            {/* ── Active hiring details ──
                When studio toggles "Actively Hiring" on, surface a box
                where they describe the role in detail (start date, position
                type, qualification, etc). Hidden when "Not Hiring". */}
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
                            ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                            : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                      <input
                        type="date"
                        value={form.hiringStartDate}
                        onChange={e => update('hiringStartDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                      />
                    </div>
                  </Field>

                  <Field label="Duration">
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                      <input
                        value={form.hiringDuration}
                        onChange={e => update('hiringDuration', e.target.value)}
                        placeholder="e.g. 4 weekends, 3 months"
                        className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Compensation / Offer">
                  <input
                    value={form.hiringCompensation}
                    onChange={e => update('hiringCompensation', e.target.value)}
                    placeholder="e.g. $80/class, shared accommodation, energy exchange"
                    className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </Field>

                <Field label="Minimum Qualification">
                  <div className="relative">
                    <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                    <select
                      value={form.hiringQualificationLevel}
                      onChange={e => update('hiringQualificationLevel', e.target.value)}
                      className="w-full appearance-none bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-9 py-3 text-[#3E3D38] text-sm focus:outline-none focus:border-[#2DA4D6] transition-all"
                    >
                      {QUALIFICATION_LEVELS.map(q => (
                        <option key={q.id} value={q.id}>{q.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                  </div>
                </Field>
              </div>
            )}
          </div>

          {/* Disciplines */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Disciplines Offered</h2>
              {(form.disciplines || []).length > 0 && (
                <span className="text-[10px] font-bold text-[#2DA4D6] bg-[#2DA4D6]/10 px-2.5 py-1 rounded-full">
                  {form.disciplines.length} selected
                </span>
              )}
            </div>

            {/* Selected chips */}
            {(form.disciplines || []).length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-[#2DA4D6]/10 rounded-xl border border-[#2DA4D6]/20">
                {form.disciplines.map(d => (
                  <span key={d} className="flex items-center gap-1 bg-[#2DA4D6] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {d}
                    <button type="button" onClick={() => toggleItem('disciplines', d)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
              <Search size={14} className="text-[#9A9A94]" />
              <input
                type="text"
                value={disciplineSearch}
                onChange={e => setDisciplineSearch(e.target.value)}
                placeholder="Search disciplines..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
              />
              {disciplineSearch && (
                <button onClick={() => setDisciplineSearch('')}>
                  <X size={12} className="text-[#9A9A94]" />
                </button>
              )}
            </div>

            {/* Category list */}
            <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
              {filteredDisciplines.map(cat => (
                <div key={cat.id}>
                  <p className="text-[9px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
                    {cat.emoji} {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map(d => (
                      <button key={d} type="button" onClick={() => toggleItem('disciplines', d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${form.disciplines.includes(d)
                            ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                            : 'border-[#E5E0D8] text-[#3E3D38] hover:border-[#2DA4D6] hover:bg-[#FBF8E4]'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════
               REVIEWS FROM INSTRUCTORS
             ══════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Reviews from Instructors</h2>
            </div>
            <p className="text-xs text-[#9A9A94]">
              Feedback from instructors you've hired. Instructors can review you after an accepted job application.
            </p>
            <ReviewList
              userId={user?.user_id}
              direction="instructor_to_studio"
              emptyLabel="No reviews yet — instructors can leave a review after you hire them on Moving Guru."
            />
          </div>

        </div>

        {/* ─────── RIGHT COLUMN — Sticky sidebar ─────── */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-5">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Studio Photo
              </p>
              <div
                onClick={() => avatarRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#2DA4D6] transition-all flex items-center justify-center bg-[#FDFCF8] relative group"
              >
                {form.avatarPreview ? (
                  <>
                    <img src={form.avatarPreview} alt="Studio" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#3E3D38]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={22} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] flex items-center justify-center text-white font-['Unbounded'] font-black text-lg mx-auto mb-3">
                      {initials}
                    </div>
                    <Upload size={18} className="text-[#C4BCB4] mx-auto mb-1" />
                    <p className="text-[10px] text-[#9A9A94]">Click to upload</p>
                  </div>
                )}
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              <p className="text-center text-sm font-['Unbounded'] font-black text-[#3E3D38] mt-3 truncate">
                {form.studioName || 'Your Studio'}
              </p>
              {(form.location || form.country) && (
                <p className="text-center text-[10px] text-[#9A9A94] mt-0.5 truncate">
                  {[form.location, form.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {/* Hiring status toggle */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Hiring Status
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update('profileStatus', 'active')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === 'active'
                      ? 'bg-[#6BE6A4]/20 border-[#6BE6A4] text-[#3E3D38]'
                      : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#6BE6A4]'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${form.profileStatus === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                  Hiring
                </button>
                <button
                  type="button"
                  onClick={() => update('profileStatus', 'inactive')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${form.profileStatus === 'inactive'
                      ? 'bg-[#FBF8E4] border-[#9A9A94] text-[#6B6B66]'
                      : 'border-[#E5E0D8] text-[#9A9A94] hover:border-[#9A9A94]'}`}
                >
                  Not Hiring
                </button>
              </div>
              <p className="text-[10px] text-[#9A9A94] mt-2 leading-relaxed">
                {form.profileStatus === 'active'
                  ? 'Visible to instructors looking for work'
                  : 'Hidden from the instructor feed'}
              </p>
            </div>

            {/* Gallery mini-grid */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-3">
                Gallery ({(form.photos || []).length}/4)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    onClick={() => photosRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden cursor-pointer hover:border-[#2DA4D6] transition-all flex items-center justify-center bg-[#FDFCF8] relative group"
                  >
                    {form.photos[i] ? (
                      <>
                        <img src={form.photos[i]} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#3E3D38]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <Upload size={16} className="text-[#C4BCB4]" />
                    )}
                  </div>
                ))}
              </div>
              <input ref={photosRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              <p className="text-[10px] text-[#9A9A94] text-center mt-2">Click any slot to upload 4 photos</p>
            </div>

            {/* Action buttons — sticky Save */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-50"
              >
                {saving ? <ButtonLoader size={16} /> : <><Save size={14} /> Save Changes</>}
              </button>
              <button
                onClick={() => setPreview(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-all"
              >
                <Eye size={14} /> Preview
              </button>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}