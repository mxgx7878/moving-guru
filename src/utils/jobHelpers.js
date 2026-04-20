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
export const getApplyState = (application) => {
  if (!application || application.status === 'withdrawn') return 'none';
  if (application.status === 'accepted') return 'accepted';
  if (application.status === 'rejected') {
    return application.can_reapply_at ? 'rejected_locked' : 'rejected_open';
  }
  return application.status; // pending | viewed
};
