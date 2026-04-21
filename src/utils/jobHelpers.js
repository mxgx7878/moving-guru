/**
 * Map the backend `application` object attached per job (or null) into the
 * UI state the Apply button cares about:
 *   none            — never applied / withdrawn / rejection lock expired
 *   pending         — applied, studio hasn't opened it
 *   viewed          — studio opened it, no decision
 *   accepted        — studio accepted
 *   rejected_locked — studio rejected, still inside the 3-month window
 *   rejected_open   — studio rejected, lock expired, can re-apply
 */
export const getApplyState = (applicationOrJob) => {
  // Allow either signature — legacy callers pass just the application.
  const job = applicationOrJob && 'vacancies' in applicationOrJob ? applicationOrJob : null;
  const application = job ? job.application : applicationOrJob;
 
  // Capacity / active state takes precedence
  if (job) {
    const isFull = job.is_full
      || (job.vacancies != null && (job.positions_filled || 0) >= job.vacancies);
    const isInactive = job.is_active === false;
    // If instructor was already accepted, keep showing accepted — they
    // count as one of the filled slots. Otherwise show 'full'.
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
  return application.status; // pending | viewed
};