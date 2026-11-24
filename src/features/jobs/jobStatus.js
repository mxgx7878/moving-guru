export const resolveJobStatus = (job) => {
  if (!job) return 'unknown';
  if (job.is_active === false) return 'inactive';
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  if (filled >= vacancies) return 'full';
  return 'active';
};
