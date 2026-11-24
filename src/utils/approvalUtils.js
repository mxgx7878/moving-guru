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

  if (user.role === 'admin') return 'approved';

  return raw === 'active' ? 'approved' : 'unknown';
};

export const canAccessFeatures = (user) => getAccessState(user) === 'approved';
