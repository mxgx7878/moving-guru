import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Briefcase, MapPin, Calendar, Clock,
  Edit3, Trash2, Eye, EyeOff, X, Check, ChevronDown, Users, GraduationCap,
  UserCheck, Lock,
} from 'lucide-react';
import {
  fetchMyJobs, createJob, updateJob, deleteJob,
} from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import {
  JOB_TYPES, DURATION_OPTIONS, ROLE_TYPE_OPTIONS,
  QUALIFICATION_LEVELS, QUALIFICATION_LABELS, EMPTY_JOB_FORM as EMPTY_FORM,
} from '../../constants/jobConstants';
import { DISCIPLINE_CATEGORIES } from '../../data/disciplines';
import { ButtonLoader, CardSkeleton } from '../../components/feedback';
import { JobApplicantsModal } from '../../components/modals';
import Toggle from '../../components/ui/Toggle';
import { validateJobForm } from '../../utils/validators';

/**
 * JobListings (studio portal)
 * -----------------------------------------------------------------
 * Studio-side CRUD + applicants view for job listings.
 *
 * Vacancy UX:
 *   - Create form requires vacancies (default 1).
 *   - Cards show "X of Y filled" capacity chip.
 *   - When positions_filled >= vacancies the backend auto-sets
 *     is_active=false; we surface this as a "Closed — Vacancies filled"
 *     banner and hide the active/inactive toggle to avoid confusion.
 *   - Reducing vacancies below positions_filled is blocked server-side;
 *     the error toast (via the slice) surfaces the message.
 */
export default function JobListings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myJobs, myJobsStatus } = useSelector((s) => s.job);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [applicantsJob, setApplicantsJob] = useState(null);

  useEffect(() => {
    dispatch(fetchMyJobs());
  }, [dispatch]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const toggleDiscipline = (d) => setForm((f) => ({
    ...f,
    disciplines: f.disciplines.includes(d)
      ? f.disciplines.filter((x) => x !== d)
      : [...f.disciplines, d],
  }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
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
      vacancies:           job.vacancies           || 1,
    });
    setEditingId(job.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const errs = validateJobForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Coerce vacancies to an integer before sending — the input returns a string.
    const payload = { ...form, vacancies: Number(form.vacancies) };

    setSaving(true);
    if (editingId) {
      await dispatch(updateJob({ id: editingId, ...payload }));
    } else {
      await dispatch(createJob(payload));
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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">{myJobs.length}</p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#2DA4D6]">
            {myJobs.filter((j) => j.is_active !== false).length}
          </p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Active</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-emerald-600">
            {myJobs.reduce((s, j) => s + (j.positions_filled || 0), 0)}
          </p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Hired</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <p className="font-['Unbounded'] text-2xl font-black text-[#E89560]">
            {myJobs.reduce((sum, j) => sum + (j.applicants_count || 0), 0)}
          </p>
          <p className="text-[#9A9A94] text-xs font-semibold mt-1">Applicants</p>
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
            const vacancies = job.vacancies || 1;
            const filled = job.positions_filled || 0;
            const isFull = filled >= vacancies;
            const isActive = job.is_active !== false;

            return (
              <div key={job.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all
                  ${isActive ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-80'}`}
              >
                {/* Auto-close banner */}
                {isFull && (
                  <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2 flex items-center gap-2 text-xs text-emerald-700">
                    <Lock size={12} />
                    <span className="font-semibold">Closed — all {vacancies} vacancy{vacancies !== 1 ? 'ies' : ''} filled.</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: typeInfo.color }}
                        >
                          <TypeIcon size={10} /> {typeInfo.label}
                        </span>
                        {!isActive && !isFull && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF8E4] text-[#9A9A94]">
                            Inactive
                          </span>
                        )}
                        {/* Capacity chip */}
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${isFull ? 'bg-emerald-50 text-emerald-600' : 'bg-[#2DA4D6]/10 text-[#2DA4D6]'}`}
                        >
                          <UserCheck size={10} />
                          {filled} of {vacancies} filled
                        </span>
                      </div>

                      <h3 className="font-['Unbounded'] text-base font-black text-[#3E3D38] mb-1 truncate">
                        {job.title}
                      </h3>
                      <p className="text-[#6B6B66] text-sm line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Hide the active toggle when the listing auto-closed —
                          reopening happens automatically when a hire is reversed. */}
                      {!isFull && (
                        <button
                          onClick={() => handleToggleActive(job)}
                          className="p-2 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#6B6B66]"
                          title={isActive ? 'Set inactive' : 'Set active'}
                        >
                          {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(job)}
                        className="p-2 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#6B6B66]"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#CE4F56]"
                        title="Delete"
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

            <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
              <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
                {editingId ? 'Edit Listing' : 'Post a New Listing'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94]">
                <X size={18} />
              </button>
            </div>

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
                  className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all
                    ${errors.title ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`}
                />
                {errors.title && <p className="mt-1 text-[11px] text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Role Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Describe the role, what you're looking for, and what the instructor can expect..."
                  className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all resize-none
                    ${errors.description ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`}
                />
                {errors.description && <p className="mt-1 text-[11px] text-red-500">{errors.description}</p>}
              </div>

              {/* Vacancies + Position type */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
                    Vacancies
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={form.vacancies}
                    onChange={(e) => update('vacancies', e.target.value)}
                    className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] focus:outline-none transition-all
                      ${errors.vacancies ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#2DA4D6]'}`}
                  />
                  {errors.vacancies && <p className="mt-1 text-[11px] text-red-500">{errors.vacancies}</p>}
                  <p className="mt-1 text-[10px] text-[#9A9A94]">
                    Listing closes automatically once all positions are filled.
                  </p>
                </div>

                <div className="col-span-2">
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
                  <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Compensation</label>
                  <input
                    value={form.compensation}
                    onChange={(e) => update('compensation', e.target.value)}
                    placeholder="e.g. $800/week + accommodation"
                    className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">Additional Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => update('requirements', e.target.value)}
                  rows={3}
                  placeholder="Min 2 years experience, certification required, English fluency..."
                  className="w-full bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all resize-none"
                />
              </div>

              <Toggle label="Active/Inactive" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />

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
                                ? 'bg-[#2DA4D6] text-white border-[#2DA4D6]'
                                : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6]'}`}
                          >
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
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all disabled:opacity-60">
                {saving ? <ButtonLoader size={14} /> : <Check size={14} />}
                {editingId ? 'Save Changes' : 'Post Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Applicants modal ═══ */}
      {applicantsJob && (
        <JobApplicantsModal
          job={applicantsJob}
          onClose={() => {
            setApplicantsJob(null);
            // Refresh to pick up positions_filled changes / auto-close
            dispatch(fetchMyJobs());
          }}
        />
      )}
    </div>
  );
}