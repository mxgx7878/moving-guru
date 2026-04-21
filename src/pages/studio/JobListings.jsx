import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plus, Briefcase, MapPin, Calendar, Clock,
  Edit3, Trash2, Eye, EyeOff, Users, UserCheck, Lock,
} from 'lucide-react';
import {
  fetchMyJobs, createJob, updateJob, deleteJob,
} from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { JOB_TYPES, EMPTY_JOB_FORM } from '../../constants/jobConstants';
import { ButtonLoader, CardSkeleton } from '../../components/feedback';
import { Button } from '../../components/ui';
import { JobApplicantsModal, ConfirmModal } from '../../features/modals';
import { JobForm } from '../../features/forms';

/**
 * JobListings (studio portal) — thin page that composes feature forms and
 * modals. All CRUD UI lives in src/features/forms/JobForm for reuse.
 */
export default function JobListings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myJobs, myJobsStatus } = useSelector((s) => s.job);

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [applicantsJob, setApplicantsJob] = useState(null);

  useEffect(() => { dispatch(fetchMyJobs()); }, [dispatch]);

  const openCreate = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditingJob({
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

  const handleToggleActive = async (job) => {
    await dispatch(updateJob({ id: job.id, is_active: !job.is_active }));
  };

  const filteredJobs = filterType === 'all'
    ? myJobs
    : myJobs.filter((j) => j.type === filterType);

  const loading = myJobsStatus === STATUS.LOADING && myJobs.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Job Listings</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Post opportunities and review applicants</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          Post a Listing
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatTile value={myJobs.length} label="Total" />
        <StatTile value={myJobs.filter((j) => j.is_active !== false).length} label="Active" color="text-[#2DA4D6]" />
        <StatTile value={myJobs.reduce((s, j) => s + (j.positions_filled || 0), 0)} label="Hired" color="text-emerald-600" />
        <StatTile value={myJobs.reduce((sum, j) => sum + (j.applicants_count || 0), 0)} label="Applicants" color="text-[#E89560]" />
      </div>

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

      {loading && <CardSkeleton count={3} />}

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

      {!loading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
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

function StatTile({ value, label, color = 'text-[#3E3D38]' }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
      <p className={`font-['Unbounded'] text-2xl font-black ${color}`}>{value}</p>
      <p className="text-[#9A9A94] text-xs font-semibold mt-1">{label}</p>
    </div>
  );
}

function JobCard({ job, deleting, onEdit, onDelete, onToggleActive, onViewApplicants }) {
  const typeInfo = JOB_TYPES.find((t) => t.id === job.type) || JOB_TYPES[0];
  const TypeIcon = typeInfo.icon;
  const applicantCount = job.applicants_count || 0;
  const vacancies = job.vacancies || 1;
  const filled = job.positions_filled || 0;
  const isFull = filled >= vacancies;
  const isActive = job.is_active !== false;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${isActive ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-80'}`}
    >
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
            {!isFull && (
              <button
                onClick={onToggleActive}
                className="p-2 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#6B6B66]"
                title={isActive ? 'Set inactive' : 'Set active'}
              >
                {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            )}
            <button
              onClick={onEdit}
              className="p-2 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#6B6B66]"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#CE4F56]"
              title="Delete"
            >
              {deleting ? <ButtonLoader size={14} color="#CE4F56" /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <MapPin size={12} className="text-[#9A9A94]" /> {job.location}
            </div>
          )}
          {job.start_date && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Calendar size={12} className="text-[#9A9A94]" /> {job.start_date}
            </div>
          )}
          {job.duration && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Clock size={12} className="text-[#9A9A94]" /> {job.duration}
            </div>
          )}
          {job.compensation && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] font-semibold">
              💰 {job.compensation}
            </div>
          )}
        </div>

        {(job.disciplines || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.disciplines.map((d) => (
              <span key={d} className="px-2.5 py-0.5 bg-[#2DA4D6]/10 text-[#2DA4D6] text-[10px] font-medium rounded-full">
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E5E0D8]">
          <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
            <Users size={12} />
            {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
          </div>
          <Button
            variant={applicantCount === 0 ? 'secondary' : 'primary'}
            size="sm"
            icon={Users}
            disabled={applicantCount === 0}
            onClick={onViewApplicants}
          >
            View Applicants
          </Button>
        </div>
      </div>
    </div>
  );
}
