import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Briefcase } from 'lucide-react';

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
import { JOB_TYPES } from '../../constants/jobConstants';

import {
  SearchBar, FilterSelect, TabBar, EmptyState,
} from '../../components/ui';
import { JobRow, JobDetailDrawer } from '../../features/jobs';
import { ConfirmModal } from '../../features/modals';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All statuses' },
  { id: 'active',   label: 'Active'       },
  { id: 'inactive', label: 'Deactivated'  },
  { id: 'full',     label: 'Closed / Full'},
];

// Type tabs for the TabBar — prepends an "All" tab to the JOB_TYPES list
// so the filter covers every case without each page rebuilding the array.
const TYPE_TABS = [
  { id: 'all', label: 'All Listings', color: '#3E3D38' },
  ...JOB_TYPES.map((t) => ({ id: t.id, label: t.label, icon: t.icon, color: t.color })),
];

export default function AdminJobs() {
  const dispatch = useDispatch();
  const {
    adminJobs, adminJobsStatus,
    selectedJob,
    applicantsByJobId,
    message, error,
  } = useSelector((s) => s.job);

  const [typeTab,        setTypeTab]        = useState('all');
  const [statusTab,      setStatusTab]      = useState('all');
  const [query,          setQuery]          = useState('');
  const [previewId,      setPreviewId]      = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [mutating,       setMutating]       = useState(false);

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
    if (error)   { toast.error(error);     dispatch(clearJobError()); }
  }, [error, dispatch]);

  const counts = useMemo(() => {
    const byType = JOB_TYPES.reduce((acc, t) => ({
      ...acc,
      [t.id]: adminJobs.filter((j) => j.type === t.id).length,
    }), {});
    return {
      all:      adminJobs.length,
      active:   adminJobs.filter((j) => j.is_active !== false).length,
      inactive: adminJobs.filter((j) => j.is_active === false).length,
      full:     adminJobs.filter((j) => (j.positions_filled || 0) >= (j.vacancies || 1)).length,
      ...byType,
    };
  }, [adminJobs]);

  // Client-side filter as a safety net in case the backend ignores params
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return adminJobs.filter((j) => {
      const matchType = typeTab === 'all' || j.type === typeTab;
      const matchStatus =
        statusTab === 'all' ||
        (statusTab === 'active'   && j.is_active !== false) ||
        (statusTab === 'inactive' && j.is_active === false) ||
        (statusTab === 'full'     && (j.positions_filled || 0) >= (j.vacancies || 1));
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
      <TabBar
        tabs={TYPE_TABS}
        activeId={typeTab}
        onChange={setTypeTab}
        counts={counts}
      />

      {/* ── Search + status filter ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by title, location, studio name..."
        />
        <FilterSelect
          value={statusTab}
          onChange={setStatusTab}
          options={STATUS_OPTIONS.map((s) => ({
            id:    s.id,
            label: counts[s.id] !== undefined ? `${s.label} (${counts[s.id]})` : s.label,
          }))}
        />
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#E89560] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No listings found"
            message="Try adjusting your search or filters."
          />
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
                  <JobRow
                    key={job.id}
                    job={job}
                    busy={mutating}
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
