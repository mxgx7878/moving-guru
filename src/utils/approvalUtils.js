// Helpers for gating routes behind admin approval. Used by AccessBanner
// (shows the pinned banner) and RequireApproved (blocks the route). Both
// files call these directly so they always agree on what "access" means.
//
// Access states:
//   'approved'   — active account, unrestricted
//   'incomplete' — user still has required profile fields missing
//   'pending'    — profile submitted, awaiting admin review
//   'rejected'   — admin denied
//   'suspended'  — admin disabled the account
//   'unknown'    — no user / status couldn't be resolved
//
// The backend may return `status`, `profile_status` or fall back to
// `is_active`; we normalise all three.
const resolveRawStatus = (user) => {
  if (!user) return null;
  if (user.status) return user.status;
  if (user.profile_status) return user.profile_status;
  if (user.is_active === false) return 'suspended';
  return 'active';
};

export const getAccessState = (user) => {
  if (!user) return 'unknown';

  const raw = resolveRawStatus(user);

  if (raw === 'suspended')  return 'suspended';
  if (raw === 'rejected')   return 'rejected';
  if (raw === 'pending')    return 'pending';
  if (raw === 'incomplete') return 'incomplete';

  // Admins bypass profile-completeness checks.
  if (user.role === 'admin') return 'approved';

  return raw === 'active' ? 'approved' : 'unknown';
};

export const canAccessFeatures = (user) => getAccessState(user) === 'approved';
