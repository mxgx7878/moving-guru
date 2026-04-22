// Derives a single status key from a job's flags so one StatusPill
// config covers every case. Jobs don't have a `status` column — it's
// derived from `is_active` (suspension) and `positions_filled` vs
// `vacancies` (capacity). Keys match JOB_STATUS_CONFIG in
// src/constants/jobConstants.js.
export const resolveJobStatus = (job) => {
  if (!job) return 'unknown';
  if (job.is_active === false) return 'inactive';
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  if (filled >= vacancies) return 'full';
  return 'active';
};
