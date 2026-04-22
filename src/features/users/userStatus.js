// Backend may return `status` or fall back to `is_active`; normalise so
// the rest of the app only deals with the status keys defined in
// USER_STATUS_CONFIG (src/constants/userConstants.js).
export const resolveUserStatus = (user) =>
  user?.status || (user?.is_active === false ? 'suspended' : 'active');
