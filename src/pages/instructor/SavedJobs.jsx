import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Bookmark, Briefcase } from 'lucide-react';

import { fetchJobs, applyToJob } from '../../store/actions/jobAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton } from '../../components/feedback';
import { EmptyState } from '../../components/ui';
import { ApplyJobModal } from '../../features/modals';
import { InstructorJobCard } from '../../features/jobs';
import { loadSavedJobs, saveSavedJobs, toggleSavedJob } from '../../utils/savedJobsStorage';

export default function SavedJobs() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { jobs, status, applyingJobId } = useSelector((s) => s.job);

  const [savedJobs,   setSavedJobs]   = useState(() => loadSavedJobs());
  const [applyTarget, setApplyTarget] = useState(null);

  useEffect(() => {
    // Always refresh the public list so we have fresh titles/details to render.
    if (jobs.length === 0) dispatch(fetchJobs());
  }, [dispatch, jobs.length]);

  useEffect(() => { saveSavedJobs(savedJobs); }, [savedJobs]);

  const saved = useMemo(
    () => jobs.filter((j) => savedJobs.includes(j.id)),
    [jobs, savedJobs],
  );

  const toggleSave = (id) => setSavedJobs((prev) => toggleSavedJob(prev, id));

  const submitApply = async (message) => {
    if (!applyTarget) return;
    const result = await dispatch(applyToJob({ jobId: applyTarget.id, message }));
    setApplyTarget(null);
    if (applyToJob.fulfilled.match(result)) {
      toast.success('Application sent — the studio will be in touch.');
    } else {
      toast.error(result.payload || 'Could not send application.');
    }
  };

  const loading = status === STATUS.LOADING && jobs.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#CE4F56]/5 rounded-2xl p-6 border border-[#E5E0D8]">
        <p className="text-[#CE4F56] text-xs font-semibold tracking-widest uppercase mb-2">Saved Jobs</p>
        <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">Your Shortlist</h1>
        <p className="text-[#6B6B66] text-sm">
          {saved.length} saved listing{saved.length !== 1 ? 's' : ''} — apply when you're ready
        </p>
      </div>

      {loading && <CardSkeleton count={3} />}

      {!loading && saved.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E0D8]">
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            message="Tap the bookmark icon on any listing in Find Work to save it here."
          />
        </div>
      )}

      {!loading && saved.length > 0 && (
        <div className="space-y-4">
          {saved.map((job) => (
            <InstructorJobCard
              key={job.id}
              job={job}
              user={user}
              isSaved
              isApplying={applyingJobId === job.id}
              onToggleSave={() => toggleSave(job.id)}
              onApply={() => setApplyTarget(job)}
            />
          ))}
        </div>
      )}

      {applyTarget && (
        <ApplyJobModal
          job={applyTarget}
          submitting={applyingJobId === applyTarget.id}
          onClose={() => setApplyTarget(null)}
          onSubmit={submitApply}
        />
      )}
    </div>
  );
}
