export const getApplyState = (applicationOrJob) => {
  const job = applicationOrJob && 'vacancies' in applicationOrJob ? applicationOrJob : null;
  const application = job ? job.application : applicationOrJob;
 
  if (job) {
    const isFull = job.is_full
      || (job.vacancies != null && (job.positions_filled || 0) >= job.vacancies);
    const isInactive = job.is_active === false;
    if (isFull || isInactive) {
      if (application && application.status === 'accepted') return 'accepted';
      return 'full';
    }
  }
 
  if (!application || application.status === 'withdrawn') return 'none';
  if (application.status === 'accepted') return 'accepted';
  if (application.status === 'rejected') {
    return application.can_reapply_at ? 'rejected_locked' : 'rejected_open';
  }
  return application.status;
};
