import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Briefcase, Search, Filter, X, Loader2, MapPin, Calendar, Clock,
  Users, Eye, Trash2, UserCheck, Lock, ChevronDown,
  Building2, GraduationCap, DollarSign, ExternalLink,
  CheckCircle2, Ban, Mail,
} from 'lucide-react';

import {
  fetchAdminJobs,
  fetchAdminJobDetail,
  fetchJobApplicants,
  activateAdminJob,
  deactivateAdminJob,
  deleteAdminJob,
} from '../../store/actions/jobAction';
import {
  clearJobError,
  clearJobMessage,
  clearSelectedJob,
} from '../../store/slices/jobSlice';
import { STATUS } from '../../constants/apiConstants';
import {
  JOB_TYPES, TYPE_STYLES,
  ROLE_TYPE_LABELS, QUALIFICATION_LABELS,
} from '../../constants/jobConstants';
import { ConfirmModal } from '../../features/modals';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All statuses' },
  { id: 'active',   label: 'Active' },
  { id: 'inactive', label: 'Deactivated' },
  { id: 'full',     label: 'Closed / Full' },
];

// ═══════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════
export default function AdminJobs() {
  const dispatch = useDispatch();
  const {
    adminJobs, adminJobsStatus,
    selectedJob,
    applicantsByJobId,
    message, error,
  } = useSelector((s) => s.job);

  const [typeTab,   setTypeTab]   = useState('all');
  const [statusTab, setStatusTab] = useState('all');
  const [query,     setQuery]     = useState('');
  const [previewId, setPreviewId] = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [mutating, setMutating]   = useState(false);

  // Applicants for the currently-opened job — reuses the shared bucket
  const applicantBucket  = previewId ? applicantsByJobId[previewId] : null;
  const applicants       = applicantBucket?.applicants || [];
  const applicantsStatus = applicantBucket?.status || STATUS.IDLE;

  // ── Fetch on filter change ───────────────────────────────────
  useEffect(() => {
    const params = {};
    if (typeTab   !== 'all') params.type   = typeTab;
    if (statusTab !== 'all') params.status = statusTab;
    if (query.trim())        params.q      = query.trim();
    dispatch(fetchAdminJobs(params));
  }, [dispatch, typeTab, statusTab, query]);

  // ── Fetch detail + applicants when drawer opens ──────────────
  useEffect(() => {
    if (previewId) {
      dispatch(fetchAdminJobDetail(previewId));
      dispatch(fetchJobApplicants(previewId));
    } else {
      dispatch(clearSelectedJob());
    }
  }, [previewId, dispatch]);

  // ── Toasts ───────────────────────────────────────────────────
  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearJobMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearJobError()); }
  }, [error, dispatch]);

  const counts = useMemo(() => ({
    all:      adminJobs.length,
    active:   adminJobs.filter((j) => j.is_active !== false).length,
    inactive: adminJobs.filter((j) => j.is_active === false).length,
    full:     adminJobs.filter((j) => (j.positions_filled || 0) >= (j.vacancies || 1)).length,
  }), [adminJobs]);

  // Client-side filter as a safety net in case backend ignores params
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return adminJobs.filter((j) => {
      const matchType = typeTab === 'all' || j.type === typeTab;
      const matchStatus =
        statusTab === 'all' ||
        (statusTab === 'active' && j.is_active !== false) ||
        (statusTab === 'inactive' && j.is_active === false) ||
        (statusTab === 'full' && (j.positions_filled || 0) >= (j.vacancies || 1));
      const matchQ = !q ||
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.studio?.name?.toLowerCase().includes(q) ||
        j.studio?.studio_name?.toLowerCase().includes(q);
      return matchType && matchStatus && matchQ;
    });
  }, [adminJobs, typeTab, statusTab, query]);

  // ── Handlers ─────────────────────────────────────────────────
  const runMutation = async (thunk) => {
    setMutating(true);
    await dispatch(thunk);
    setMutating(false);
  };

  const handleActivate   = (job) => runMutation(activateAdminJob(job.id));
  const handleDeactivate = (job) => runMutation(deactivateAdminJob(job.id));

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const id = deletingTarget.id;
    setDeletingTarget(null);
    if (previewId === id) setPreviewId(null);
    await runMutation(deleteAdminJob(id));
  };

  const isLoading = adminJobsStatus === STATUS.LOADING && adminJobs.length === 0;

  // ═══════════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E89560]/10 rounded-2xl flex items-center justify-center">
            <Briefcase size={22} className="text-[#E89560]" />
          </div>
          <div>
            <p className="text-[#E89560] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Job Management
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Platform Job Listings
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Moderate listings posted by studios. View applicants, deactivate spam, or delete outright.
            </p>
          </div>
        </div>
      </div>

      {/* ── Type tabs ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          active={typeTab === 'all'}
          onClick={() => setTypeTab('all')}
          label="All Listings"
          count={counts.all}
          color="#3E3D38"
        />
        {JOB_TYPES.map((t) => {
          const Icon = t.icon;
          const c = adminJobs.filter((j) => j.type === t.id).length;
          return (
            <TabButton
              key={t.id}
              active={typeTab === t.id}
              onClick={() => setTypeTab(t.id)}
              label={t.label}
              icon={Icon}
              count={c}
              color={t.color}
            />
          );
        })}
      </div>

      {/* ── Search + status filter ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, location, studio name..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#9A9A94]" />
          <select value={statusTab} onChange={(e) => setStatusTab(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}{counts[s.id] !== undefined ? ` (${counts[s.id]})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="text-[#9A9A94]" />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={26} className="animate-spin text-[#E89560]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase size={36} className="mx-auto text-[#C4BCB4] mb-3" />
            <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">No listings found</p>
            <p className="text-[#9A9A94] text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCF8] text-left">
                <tr className="text-[10px] text-[#9A9A94] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Listing</th>
                  <th className="py-3 px-4 font-semibold">Studio</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Applicants</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <JobRow key={job.id} job={job} busy={mutating}
                    onPreview={() => setPreviewId(job.id)}
                    onActivate={() => handleActivate(job)}
                    onDeactivate={() => handleDeactivate(job)}
                    onDelete={() => setDeletingTarget(job)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────── */}
      {previewId && (
        <JobDetailDrawer
          job={selectedJob || adminJobs.find((j) => j.id === previewId)}
          applicants={applicants}
          applicantsStatus={applicantsStatus}
          busy={mutating}
          onClose={() => setPreviewId(null)}
          onActivate={() => selectedJob && handleActivate(selectedJob)}
          onDeactivate={() => selectedJob && handleDeactivate(selectedJob)}
          onDelete={(j) => setDeletingTarget(j)}
        />
      )}

      {/* ── Delete confirmation ─────────────────────────────── */}
      {deletingTarget && (
        <ConfirmModal
          title="Delete listing?"
          message={`Permanently delete "${deletingTarget.title}"? Applicants will be notified.`}
          confirmLabel="Delete"
          loading={mutating}
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function TabButton({ active, onClick, label, icon: Icon, count, color }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
        ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
      style={active ? { backgroundColor: color } : {}}>
      {Icon && <Icon size={13} />} {label}
      {typeof count === 'number' && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
          ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>{count}</span>
      )}
    </button>
  );
}

function JobRow({ job, busy, onPreview, onActivate, onDeactivate, onDelete }) {
  const type = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
  const TypeIcon = type.icon;
  const isActive = job.is_active !== false;
  const vacancies = job.vacancies || 1;
  const filled = job.positions_filled || 0;
  const isFull = filled >= vacancies;
  const applicants = job.applicants_count || 0;
  const studioName = job.studio?.studio_name || job.studio?.name || 'Unknown';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: type.color + '15' }}>
            <TypeIcon size={14} style={{ color: type.color }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#3E3D38] text-xs line-clamp-1">{job.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: type.color }}>
                {type.label}
              </span>
              {job.role_type && (
                <span className="text-[10px] text-[#9A9A94]">
                  · {ROLE_TYPE_LABELS[job.role_type] || job.role_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-xs text-[#3E3D38]">
          <Building2 size={11} className="text-[#9A9A94]" />
          <span className="truncate max-w-[140px]">{studioName}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        {job.location ? (
          <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
            <MapPin size={11} /> {job.location}
          </span>
        ) : <span className="text-xs text-[#C4BCB4]">—</span>}
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
          <Users size={11} className="text-[#9A9A94]" />
          {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
        </span>
        <span className="text-[10px] text-[#9A9A94]">
          {filled}/{vacancies} filled
        </span>
      </td>
      <td className="py-3 px-4">
        <StatusPill active={isActive} full={isFull} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5">
          <IconBtn title="View details" onClick={onPreview}>
            <Eye size={13} />
          </IconBtn>

          {isActive ? (
            <IconBtn title="Deactivate" onClick={onDeactivate} color="red" disabled={busy}>
              <Ban size={13} />
            </IconBtn>
          ) : (
            <IconBtn title="Activate" onClick={onActivate} color="green" disabled={busy}>
              <CheckCircle2 size={13} />
            </IconBtn>
          )}

          <IconBtn title="Delete" onClick={onDelete} color="red" disabled={busy}>
            <Trash2 size={13} />
          </IconBtn>
        </div>
      </td>
    </tr>
  );
}

function JobDetailDrawer({
  job, applicants, applicantsStatus, busy, onClose,
  onActivate, onDeactivate, onDelete,
}) {
  if (!job) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-10">
          <Loader2 size={26} className="animate-spin text-[#E89560]" />
        </div>
      </div>
    );
  }

  const type = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
  const TypeIcon = type.icon;
  const isActive = job.is_active !== false;
  const vacancies = job.vacancies || 1;
  const filled = job.positions_filled || 0;
  const isFull = filled >= vacancies;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8">

        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl flex items-start justify-between gap-4"
          style={{ backgroundColor: type.color + '15' }}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: type.color }}>
              <TypeIcon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: type.color }}>
                  {type.label}
                </span>
                {job.role_type && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3E3D38] text-white">
                    {ROLE_TYPE_LABELS[job.role_type] || job.role_type}
                  </span>
                )}
                <StatusPill active={isActive} full={isFull} />
              </div>
              <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
                {job.title}
              </h2>
              <p className="text-[11px] text-[#6B6B66] mt-0.5">
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
                {job.studio && (
                  <> by <span className="font-semibold">
                    {job.studio.studio_name || job.studio.name}
                  </span></>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg text-[#6B6B66] flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Quick meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaTile icon={Users}     label="Applicants" value={applicants.length || job.applicants_count || 0} />
            <MetaTile icon={UserCheck} label="Filled"     value={`${filled} / ${vacancies}`} />
            <MetaTile icon={MapPin}    label="Location"   value={job.location || '—'} />
            <MetaTile icon={Calendar}  label="Start"      value={job.start_date || '—'} />
          </div>

          {/* Description */}
          {job.description && (
            <Section label="Description">
              <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </Section>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Info icon={Clock}         label="Duration"      value={job.duration} />
            <Info icon={DollarSign}    label="Compensation"  value={job.compensation} />
            <Info icon={GraduationCap} label="Qualification" value={QUALIFICATION_LABELS[job.qualification_level] || job.qualification_level} />
            <Info icon={UserCheck}     label="Vacancies"     value={vacancies} />
          </div>

          {job.requirements && (
            <Section label="Requirements">
              <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
                {job.requirements}
              </p>
            </Section>
          )}

          {(job.disciplines || []).length > 0 && (
            <Section label="Disciplines">
              <div className="flex flex-wrap gap-1.5">
                {job.disciplines.map((d) => (
                  <span key={d} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                    {d}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Studio quick-link */}
          {job.studio && (
            <div className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#2DA4D6] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {(job.studio.studio_name || job.studio.name || '?')
                    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-['Unbounded'] text-xs font-black text-[#3E3D38] truncate">
                    {job.studio.studio_name || job.studio.name}
                  </p>
                  {job.studio.email && (
                    <p className="text-[10px] text-[#9A9A94] flex items-center gap-1 truncate">
                      <Mail size={9} /> {job.studio.email}
                    </p>
                  )}
                </div>
              </div>
              <Link to="/admin/users?role=studio"
                className="text-[11px] font-bold text-[#2DA4D6] hover:underline flex items-center gap-1 flex-shrink-0">
                View in users <ExternalLink size={10} />
              </Link>
            </div>
          )}

          {/* Applicants list */}
          <Section label={`Applicants (${applicants.length})`}>
            {applicantsStatus === STATUS.LOADING ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 size={18} className="animate-spin text-[#E89560]" />
              </div>
            ) : applicants.length === 0 ? (
              <p className="text-xs text-[#9A9A94] py-3">No applications yet.</p>
            ) : (
              <div className="space-y-2">
                {applicants.map((app) => (
                  <ApplicantRow key={app.id} app={app} />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] flex flex-wrap justify-end gap-2">
          {isActive ? (
            <button onClick={onDeactivate} disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#6B6B66] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors disabled:opacity-60">
              <Ban size={13} /> Deactivate
            </button>
          ) : (
            <button onClick={onActivate} disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#6B6B66] hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-60">
              <CheckCircle2 size={13} /> Activate
            </button>
          )}
          <button onClick={() => onDelete(job)} disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#EF4444] hover:bg-[#EF4444]/5 hover:border-[#EF4444] transition-colors disabled:opacity-60">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicantRow({ app }) {
  const user = app.instructor || app.user || {};
  const name = user.name || 'Unknown';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const statusCfg = {
    pending:  { label: 'Pending',   cls: 'bg-[#2DA4D6]/10 text-[#2DA4D6]' },
    viewed:   { label: 'Viewed',    cls: 'bg-[#FBF8E4] text-[#6B6B66]'    },
    accepted: { label: 'Hired',     cls: 'bg-emerald-50 text-emerald-600' },
    rejected: { label: 'Declined',  cls: 'bg-red-50 text-red-500'         },
    withdrawn:{ label: 'Withdrawn', cls: 'bg-gray-100 text-gray-500'      },
  }[app.status] || { label: app.status || 'Pending', cls: 'bg-gray-100 text-gray-500' };

  return (
    <div className="flex items-center justify-between gap-3 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#CE4F56] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#3E3D38] text-xs truncate">{name}</p>
          {user.email && (
            <p className="text-[10px] text-[#9A9A94] flex items-center gap-1 truncate">
              <Mail size={9} /> {user.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
        {app.created_at && (
          <span className="text-[10px] text-[#9A9A94] hidden sm:inline">
            {new Date(app.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusPill({ active, full }) {
  if (full) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
        <Lock size={10} /> Closed / Full
      </span>
    );
  }
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
        <Ban size={10} /> Deactivated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
      <CheckCircle2 size={10} /> Active
    </span>
  );
}

function IconBtn({ children, title, onClick, disabled, color = 'default' }) {
  const colorCls = {
    default: 'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]',
    green:   'border-[#E5E0D8] text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500',
    red:     'border-[#E5E0D8] text-red-500 hover:bg-red-50 hover:border-red-500',
  }[color];
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorCls}`}>
      {children}
    </button>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-0.5">
        {Icon && <Icon size={10} />} {label}
      </p>
      <p className="text-[#3E3D38]">{value}</p>
    </div>
  );
}

function MetaTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1">
        {Icon && <Icon size={10} />} {label}
      </p>
      <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] truncate">{value}</p>
    </div>
  );
}