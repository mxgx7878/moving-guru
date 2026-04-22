// Roles that bypass all approval gating
const UNGATED_ROLES = ['admin'];

// Core field check — what counts as a "complete" profile per role.
// Tune these to match what the backend considers complete.
export const isProfileComplete = (user) => {
  if (!user) return false;
  if (UNGATED_ROLES.includes(user.role)) return true;

  const base = Boolean(user.email  && user.location);

  if (user.role === 'studio') {
    return base
      && Boolean(user.studio_name || user.name)
      && Boolean(user.bio || user.description)
      && Boolean(user.phone)
  }

  if (user.role === 'instructor') {
    return base
      && Boolean(user.name)
      && Boolean(user.bio)
      && Array.isArray(user.disciplines)
      && user.disciplines.length > 0;
  }

  return true;
};

// Resolves the user's effective state in ONE string.
//   suspended → should never reach the portal (blocked at login)
//   rejected  → admin rejected the signup
//   incomplete → still needs to finish profile
//   pending   → profile ready, waiting on admin
//   approved  → full access
export const getAccessState = (user) => {
  if (!user) return 'unknown';
  if (UNGATED_ROLES.includes(user.role)) return 'approved';

  if (user.status === 'suspended' || user.is_active === false) return 'suspended';
  if (user.status === 'rejected') return 'rejected';

  if (!isProfileComplete(user)) return 'incomplete';

  // Backend can use either `status: 'approved'` or boolean `is_approved`
  const approved = user.status === 'active'
                || user.status === 'approved'
                || user.is_approved === true;

  return approved ? 'approved' : 'pending';
};

export const canAccessFeatures = (user) =>
  getAccessState(user) === 'approved';