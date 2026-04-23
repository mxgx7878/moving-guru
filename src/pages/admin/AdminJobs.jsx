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
  PageHeader, Toolbar, TabBar, DataTable, EmptyState,
} from '../../components/ui';
import { JobRow, JobDetailDrawer } from '../../features/jobs';
import { ConfirmModal } from '../../features/modals';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All statuses' },
  { id: 'active',   label: 'Active'       },
  { id: 'inactive', label: 'Deactivated'  },
  { id: 'full',     label: 'Closed / Full'},
];

const TYPE_TABS = [
  { id: 'all', label: 'All Listings', color: '#3E3D38' },
  ...JOB_TYPES.map((t) => ({ id: t.id, label: t.label, icon: t.icon, color: t.color })),
];

const JOB_COLUMNS = [
  { key: 'listing',    label: 'Listing' },
  { key: 'studio',     label: 'Studio' },
  { key: 'location',   label: 'Location' },
  { key: 'applicants', label: 'Applicants' },
  { key: 'status',     label: 'Status' },
  { key: 'actions',    label: 'Actions', align: 'right' },
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

  const applicantBucket  = previewId ? applicantsByJobId[previewId] : null;
  const applicants       = applicantBucket?.applicants || [];
  const applicantsStatus = applicantBucket?.status || STATUS.IDLE;

  useEffect(() => {
    const params = {};
    if (typeTab   !== 'all') params.type   = typeTab;
    if (statusTab !== 'all') params.status = statusTab;
    if (query.trim())        params.q      = query.trim();
    dispatch(fetchAdminJobs(params));
  }, [dispatch, typeTab, statusTab, query]);

  useEffect(() => {
    if (previewId) {
      dispatch(fetchAdminJobDetail(previewId));
      dispatch(fetchJobApplicants(previewId));
    } else {
      dispatch(clearSelectedJob());
    }
  }, [previewId, dispatch]);

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

      <PageHeader
        icon={Briefcase}
        iconBg="#E895601A"
        iconColor="#E89560"
        eyebrow="Admin / Job Management"
        eyebrowColor="#E89560"
        title="Platform Job Listings"
        description="Moderate listings posted by studios. View applicants, deactivate spam, or delete outright."
      />

      <TabBar
        tabs={TYPE_TABS}
        activeId={typeTab}
        onChange={setTypeTab}
        counts={counts}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search by title, location, studio name...',
        }}
        filters={[{
          id: 'status',
          value: statusTab,
          onChange: setStatusTab,
          options: STATUS_OPTIONS.map((s) => ({
            id:    s.id,
            label: counts[s.id] !== undefined ? `${s.label} (${counts[s.id]})` : s.label,
          })),
        }]}
      />

      <DataTable
        columns={JOB_COLUMNS}
        rows={filtered}
        loading={isLoading}
        emptyState={<EmptyState icon={Briefcase} title="No listings found" message="Try adjusting your search or filters." />}
        renderRow={(job) => (
          <JobRow
            key={job.id}
            job={job}
            busy={mutating}
            onPreview={() => setPreviewId(job.id)}
            onActivate={() => handleActivate(job)}
            onDeactivate={() => handleDeactivate(job)}
            onDelete={() => setDeletingTarget(job)}
          />
        )}
      />

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
