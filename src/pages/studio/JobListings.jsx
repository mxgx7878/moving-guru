import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Briefcase } from 'lucide-react';
import {
  fetchMyJobs, createJob, updateJob, deleteJob,
} from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_TYPES, EMPTY_JOB_FORM, getJobTypes } from '../../constants/jobConstants';
import { CardSkeleton } from '../../components/feedback';
import {
  Button, PageHeader, TabBar, EmptyState, StatTileGroup,
} from '../../components/ui';
import { JobApplicantsModal, ConfirmModal } from '../../features/modals';
import { JobForm } from '../../features/forms';
import { StudioJobCard } from '../../features/jobs';

const FILTER_TABS = [
  { id: 'all', label: 'All', color: '#CCFF00' },
  ...JOB_TYPES.map((t) => ({ id: t.id, label: t.label, icon: t.icon, color: t.color })),
];

export default function JobListings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myJobs, myJobsStatus } = useSelector((s) => s.job);

  const [showForm,       setShowForm]       = useState(false);
  const [editingJob,     setEditingJob]     = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);
  const [filterType,     setFilterType]     = useState('all');
  const [applicantsJob,  setApplicantsJob]  = useState(null);

  useEffect(() => { dispatch(fetchMyJobs()); }, [dispatch]);

  const openCreate = () => { setEditingJob(null); setShowForm(true); };

  const openEdit = (job) => {
    setEditingJob({
      title:               job.title               || '',
      types:               getJobTypes(job).length ? getJobTypes(job) : ['hire'],
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
      _id:                 job.id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    if (editingJob?._id) {
      await dispatch(updateJob({ id: editingJob._id, ...payload }));
    } else {
      await dispatch(createJob(payload));
    }
    setSaving(false);
    setShowForm(false);
    setEditingJob(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    setDeletingId(deletingTarget.id);
    await dispatch(deleteJob(deletingTarget.id));
    setDeletingId(null);
    setDeletingTarget(null);
  };

  const handleToggleActive = (job) =>
    dispatch(updateJob({ id: job.id, is_active: !job.is_active }));

    const filteredJobs = filterType === 'all'
      ? myJobs
      : myJobs.filter((j) => getJobTypes(j).includes(filterType));

    const counts = {
      all: myJobs.length,
      ...JOB_TYPES.reduce((acc, t) => ({
        ...acc,
        [t.id]: myJobs.filter((j) => getJobTypes(j).includes(t.id)).length,
      }), {}),
    };

  const loading = myJobsStatus === STATUS.LOADING && myJobs.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader
        title="Job Listings"
        description="Post opportunities and review applicants"
        actions={(
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Post a Listing
          </Button>
        )}
      />

      <StatTileGroup
        columns={4}
        tiles={[
          { label: 'Total',      value: myJobs.length },
          { label: 'Active',     value: myJobs.filter((j) => j.is_active !== false).length, color: 'text-[#2DA4D6]' },
          { label: 'Hired',      value: myJobs.reduce((s, j) => s + (j.positions_filled || 0), 0), color: 'text-emerald-600' },
          { label: 'Applicants', value: myJobs.reduce((sum, j) => sum + (j.applicants_count || 0), 0), color: 'text-[#E89560]' },
        ]}
      />

      <TabBar
        tabs={FILTER_TABS}
        activeId={filterType}
        onChange={setFilterType}
        counts={counts}
      />

      {loading && <CardSkeleton count={3} />}

      {!loading && filteredJobs.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Briefcase}
            title={myJobs.length === 0 ? 'No listings yet' : 'No listings match this filter'}
            message={myJobs.length === 0
              ? 'Post your first job listing or swap offer to attract instructors'
              : 'Try switching to a different listing type'}
            action={myJobs.length === 0 && (
              <Button variant="ghost" size="sm" onClick={openCreate} className="!text-sky-mg hover:!underline">
                Create a listing
              </Button>
            )}
          />
        </div>
      )}

      {!loading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <StudioJobCard
              key={job.id}
              job={job}
              deleting={deletingId === job.id}
              onEdit={() => openEdit(job)}
              onDelete={() => setDeletingTarget(job)}
              onToggleActive={() => handleToggleActive(job)}
              onViewApplicants={() => setApplicantsJob(job)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <JobForm
          initial={editingJob || EMPTY_JOB_FORM}
          saving={saving}
          onCancel={() => { setShowForm(false); setEditingJob(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {applicantsJob && (
        <JobApplicantsModal
          job={applicantsJob}
          onClose={() => {
            setApplicantsJob(null);
            dispatch(fetchMyJobs());
          }}
        />
      )}

      {deletingTarget && (
        <ConfirmModal
          title="Delete listing?"
          message={`Delete "${deletingTarget.title}"? This will also remove any applicants who have applied.`}
          confirmLabel="Delete"
          loading={deletingId === deletingTarget.id}
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
