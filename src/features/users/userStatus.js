export const resolveUserStatus = (user) =>
  user?.status || (user?.is_active === false ? 'suspended' : 'active');
