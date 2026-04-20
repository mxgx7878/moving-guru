import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Briefcase, RefreshCw, Zap, MapPin, Calendar, Clock,
  Edit3, Trash2, Eye, EyeOff, X, Check, ChevronDown, Users, GraduationCap,
} from 'lucide-react';
import {
  fetchMyJobs, createJob, updateJob, deleteJob,
} from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { ButtonLoader, CardSkeleton } from '../../components/feedback';
import 
JobApplicantsModal from '../../components/studio/JobApplicantsModal';
import Toggle from '../../components/ui/Toggle';

const JOB_TYPES = [
  { id: 'hire',            label: 'Direct Hire',     icon: Briefcase, color: '#2DA4D6', bg: 'bg-[#2DA4D6]/10' },
  { id: 'swap',            label: 'Instructor Swap', icon: RefreshCw, color: '#E89560', bg: 'bg-[#E89560]/10' },
  { id: 'energy_exchange', label: 'Energy Exchange', icon: Zap,       color: '#6BE6A4', bg: 'bg-[#6BE6A4]/20' },
];

const DURATION_OPTIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', 'Ongoing'];

const ROLE_TYPE_OPTIONS = [
  { id: 'permanent',     label: 'Permanent'                   },
  { id: 'temporary',     label: 'Temporary'                   },
  { id: 'substitute',    label: 'Substitute'                  },
  { id: 'weekend_cover', label: 'Substitute for the weekend'  },
  { id: 'casual',        label: 'Casual / On-call'            },
];

const QUALIFICATION_LEVELS = [
  { id: 'none',                  label: 'Not required'                       },
  { id: 'intermediate',          label: 'Intermediate / High School'         },
  { id: 'diploma',               label: 'Diploma / Associate'                },
  { id: 'bachelors',             label: "Bachelor's Degree"                  },
  { id: 'masters',               label: "Master's Degree"                    },
  { id: 'doctorate',             label: 'Doctorate / PhD'                    },
  { id: 'cert_200hr',            label: '200hr Teacher Certification'        },
  { id: 'cert_500hr',            label: '500hr Teacher Certification'        },
  { id: 'cert_comprehensive',    label: 'Comprehensive Certification'        },
  { id: 'cert_specialized',      label: 'Specialised / Other Certification'  },
];

const QUALIFICATION_LABELS = QUALIFICATION_LEVELS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q.label }), {},
);

const EMPTY_FORM = {
  title: '',
  type: 'hire',
  role_type: 'permanent',
  description: '',
  disciplines: [],
  location: '',
  start_date: '',
  duration: '',
  compensation: '',
  requirements: '',
  qualification_level: 'none',
  is_active: true,
};

export default function JobListings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myJobs, myJobsStatus } = useSelector((s) => s.job);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [applicantsJob, setApplicantsJob] = useState(null);

  useEffect(() => {
    dispatch(fetchMyJobs());
  }, [dispatch]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDiscipline = (d) => setForm((f) => ({
    ...f,
    disciplines: f.disciplines.includes(d)
      ? f.disciplines.filter((x) => x !== d)
      : [...f.disciplines, d],
  }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (job) => {
    setForm({
      title:               job.title               || '',
      type:                job.type                || 'hire',
      role_type:           job.role_type           || 'permanent',
      description:         job.description         || '',
      disciplines:         job.disciplines         || [],
      location:            job.location            || user?.location || '',
      start_date:          job.start_date          || '',
      duration:            job.duration            || '',
      compensation:        job.compensation        || '',
      requirements:        job.requirements        || '',
      qualification_level: job.qualification_level || 'none',
      is_active:           job.is_active !== false,
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    if (editingId) {
      await dispatch(updateJob({ id: editingId, ...form }));
    } else {
      await dispatch(createJob(form));
    }
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This will also remove any applicants who have applied.')) return;
    setDeletingId(id);
    await dispatch(deleteJob(id));
    setDeletingId(null);
  };

  const handleToggleActive = async (job) => {
    await dispatch(updateJob({ id: job.id, is_active: !job.is_active }));
  };

  const filteredJobs = filterType === 'all'
    ? myJobs
    : myJobs.filter((j) => j.type === filterType);

  const loading = myJobsStatus === STATUS.LOADING && myJobs.length === 0;

  const filteredDisciplines = DISCIPLINE_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((d) => !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase())),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Job Listings</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Post opportunities and review applicants</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all"
        >
          <Plus size={16} /> Post a Listing
        </button>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">{myJobs.length}</p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Total Listings</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#2DA4D6]">
            {myJobs.filter((j) => j.is_active !== false).length}
          </p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Active</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#E89560]">
            {myJobs.reduce((sum, j) => sum + (j.applicants_count || 0), 0)}
          </p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Total Applicants</p>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
            ${filterType === 'all'
              ? 'bg-[#CCFF00] text-[#3E3D38] border border-[#CCFF00]'
              : 'bg-white border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
        >
          All ({myJobs.length})
        </button>
        {JOB_TYPES.map((t) => {
          const count = myJobs.filter((j) => j.type === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5
                ${filterType === t.id ? 'text-white' : 'bg-white border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={filterType === t.id ? { backgroundColor: t.color } : undefined}
            >
              <t.icon size={12} /> {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Loading ──────────────────────────────────────────── */}
      {loading && <CardSkeleton count={3} />}

      {/* ── Empty ────────────────────────────────────────────── */}
      {!loading && filteredJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center">
          <Briefcase size={32} className="text-[#C4BCB4] mx-auto mb-3" />
          <p className="text-[#3E3D38] font-semibold">
            {myJobs.length === 0 ? 'No listings yet' : 'No listings match this filter'}
          </p>
          <p className="text-[#9A9A94] text-sm mt-1">
            {myJobs.length === 0
              ? 'Post your first job listing or swap offer to attract instructors'
              : 'Try switching to a different listing type'}
          </p>
          {myJobs.length === 0 && (
            <button onClick={openCreate} className="mt-4 text-sm text-[#2DA4D6] hover:underline">
              Create a listing
            </button>
          )}
        </div>
      )}

      {/* ── Job cards ────────────────────────────────────────── */}
      {!loading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const typeInfo = JOB_TYPES.find((t) => t.id === job.type) || JOB_TYPES[0];
            const TypeIcon = typeInfo.icon;
            const applicantCount = job.applicants_count || 0;

            return (
              <div key={job.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all
                  ${job.is_active !== false ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-60'}`}>
                <div className="p-6">

                  {/* Top row: icon + title + badges + actions */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                        <TypeIcon size={18} style={{ color: typeInfo.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{job.title}</h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: typeInfo.color }}
                          >
                            {typeInfo.label}
                          </span>
                          {job.role_type && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E3D38] text-white">
                              {ROLE_TYPE_OPTIONS.find((r) => r.id === job.role_type)?.label || job.role_type}
                            </span>
                          )}
                          {job.qualification_level && job.qualification_level !== 'none' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fca6] text-[#3E3D38]">
                              <GraduationCap size={10} />
                              {QUALIFICATION_LABELS[job.qualification_level] || job.qualification_level}
                            </span>
                          )}
                          {job.is_active === false && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fca6]/40 text-[#6B6B66]">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-[#6B6B66] text-sm leading-relaxed line-clamp-2">{job.description}</p>
                      </div>
                    </div>

                    {/* Icon actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(job)}
                        className="p-2 rounded-lg hover:bg-[#FBF8E4] transition-colors text-[#9A9A94] hover:text-[#3E3D38]"
                        title={job.is_active !== false ? 'Close listing' : 'Reactivate listing'}
                      >
                        {job.is_active !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(job)}
                        className="p-2 rounded-lg hover:bg-[#FBF8E4] transition-colors text-[#9A9A94] hover:text-[#2DA4D6]"
                        title="Edit listing"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-[#9A9A94] hover:text-red-500"
                        title="Delete listing"
                      >
                        {deletingId === job.id ? <ButtonLoader size={14} color="#CE4F56" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {job.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <MapPin size={12} className="text-[#9A9A94]" />
                        {job.location}
                      </div>
                    )}
                    {job.start_date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <Calendar size={12} className="text-[#9A9A94]" />
                        {job.start_date}
                      </div>
                    )}
                    {job.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                        <Clock size={12} className="text-[#9A9A94]" />
                        {job.duration}
                      </div>
                    )}
                    {job.compensation && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] font-semibold">
                        💰 {job.compensation}
                      </div>
                    )}
                  </div>

                  {/* Disciplines */}
                  {(job.disciplines || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.disciplines.map((d) => (
                        <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom row: applicants count + CTA */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E5E0D8]">
                    <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
                      <Users size={12} />
                      {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => setApplicantsJob(job)}
                      disabled={applicantCount === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                        ${applicantCount === 0
                          ? 'bg-[#FBF8E4] text-[#9A9A94] cursor-not-allowed'
                          : 'bg-[#2DA4D6] text-white hover:bg-[#2590bd]'}`}
                    >
                      <Users size={12} /> View Applicants
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Create / Edit Modal ═══ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
              <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
                {editingId ? 'Edit Listing' : 'Post a New Listing'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94]">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Type */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Listing Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {JOB_TYPES.map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => update('type', t.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                        ${form.type === t.id ? 'text-white' : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                      style={form.type === t.id ? { borderColor: t.color, backgroundColor: t.color } : undefined}
                    >
                      <t.icon size={14} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder={form.type === 'swap'
                    ? 'e.g. Pilates Instructor Swap — Bali ↔ Sydney'
                    : 'e.g. Yoga Instructor Needed — Bali Studio'}
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Role Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Describe the role, what you're looking for, and what the instructor can expect..."
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
                />
              </div>

              {/* Position type */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Position Type</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_TYPE_OPTIONS.map((o) => (
                    <button key={o.id} type="button"
                      onClick={() => update('role_type', o.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all
                        ${form.role_type === o.id
                          ? 'bg-[#CCFF00] text-[#3E3D38] border-[#CCFF00]'
                          : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualification level */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Qualification Required</label>
                <div className="relative">
                  <select
                    value={form.qualification_level}
                    onChange={(e) => update('qualification_level', e.target.value)}
                    className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] transition-all pr-10"
                  >
                    {QUALIFICATION_LEVELS.map((q) => (
                      <option key={q.id} value={q.id}>{q.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                </div>
              </div>

              {/* Location + start date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="e.g. Bali, Indonesia"
                    className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => update('start_date', e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </div>
              </div>

              {/* Duration + compensation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Duration</label>
                  <div className="relative">
                    <select
                      value={form.duration}
                      onChange={(e) => update('duration', e.target.value)}
                      className="w-full appearance-none bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none focus:border-[#2DA4D6] transition-all pr-10"
                    >
                      <option value="">Select duration</option>
                      {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
                    {form.type === 'swap' ? 'Swap Details'
                      : form.type === 'energy_exchange' ? 'Exchange Offer'
                      : 'Compensation'}
                  </label>
                  <input
                    value={form.compensation}
                    onChange={(e) => update('compensation', e.target.value)}
                    placeholder={form.type === 'swap'
                      ? 'e.g. Studio space + accommodation'
                      : form.type === 'energy_exchange'
                        ? 'e.g. Free classes + meals'
                        : 'e.g. $800/week + accommodation'}
                    className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => update('requirements', e.target.value)}
                  rows={2}
                  placeholder="e.g. Min 2 years experience, certification required, English fluency..."
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
                />
              </div>

              <div>
                <Toggle label="Active/Inactive" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
              </div>

              {/* Disciplines */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Disciplines Needed</label>
                <input
                  type="text"
                  value={disciplineSearch}
                  onChange={(e) => setDisciplineSearch(e.target.value)}
                  placeholder="Search disciplines..."
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all mb-2"
                />

                {form.disciplines.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.disciplines.map((d) => (
                      <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-[#2DA4D6]/10 text-[#2DA4D6] rounded-full text-xs font-medium">
                        {d}
                        <button onClick={() => toggleDiscipline(d)} className="hover:text-red-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto space-y-3 border border-[#E5E0D8] rounded-xl p-3">
                  {filteredDisciplines.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-[9px] text-[#9A9A94] tracking-widest uppercase font-semibold mb-1.5">{cat.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((d) => (
                          <button key={d} type="button" onClick={() => toggleDiscipline(d)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                              ${form.disciplines.includes(d)
                                ? 'bg-[#2DA4D6] border-[#2DA4D6] text-white'
                                : 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!form.title.trim() && !form.description.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-bold text-[#3E3D38] hover:border-[#3E3D38] transition-all disabled:opacity-50"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.description.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-50"
                >
                  {saving ? <ButtonLoader size={14} /> : <Check size={14} />}
                  {editingId ? 'Save Changes' : 'Post Listing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Preview Modal ═══ */}
      {showPreview && (
        <PreviewModal form={form} onClose={() => setShowPreview(false)} />
      )}

      {/* ═══ Applicants Modal ═══ */}
      {applicantsJob && (
        <JobApplicantsModal
          job={applicantsJob}
          onClose={() => setApplicantsJob(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Preview modal — renders the listing as instructors will
   see it in their Find Work feed.
   ──────────────────────────────────────────────────────────── */
function PreviewModal({ form, onClose }) {
  const typeInfo = JOB_TYPES.find((t) => t.id === form.type) || JOB_TYPES[0];
  const TypeIcon = typeInfo.icon;
  const roleLabel = ROLE_TYPE_OPTIONS.find((r) => r.id === form.role_type)?.label;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">Listing Preview</h2>
            <p className="text-[10px] text-[#9A9A94] mt-0.5">How instructors will see your post</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                  <TypeIcon size={18} style={{ color: typeInfo.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">
                      {form.title || 'Untitled listing'}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: typeInfo.color }}
                    >
                      {typeInfo.label}
                    </span>
                    {roleLabel && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3E3D38] text-white">
                        {roleLabel}
                      </span>
                    )}
                    {form.qualification_level && form.qualification_level !== 'none' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5fca6] text-[#3E3D38]">
                        <GraduationCap size={10} />
                        {QUALIFICATION_LABELS[form.qualification_level] || form.qualification_level}
                      </span>
                    )}
                  </div>
                  <p className="text-[#6B6B66] text-sm leading-relaxed whitespace-pre-line">
                    {form.description || '—'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                {form.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <MapPin size={12} className="text-[#9A9A94]" /> {form.location}
                  </div>
                )}
                {form.start_date && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <Calendar size={12} className="text-[#9A9A94]" /> {form.start_date}
                  </div>
                )}
                {form.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
                    <Clock size={12} className="text-[#9A9A94]" /> {form.duration}
                  </div>
                )}
                {form.compensation && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] font-semibold">
                    💰 {form.compensation}
                  </div>
                )}
              </div>

              {(form.disciplines || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.disciplines.map((d) => (
                    <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">{d}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}