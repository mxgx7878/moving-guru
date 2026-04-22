import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { canAccessFeatures, getAccessState } from '../../utils/approvalUtils';
import { ROLE_THEME } from '../../config/portalConfig';

/**
 * Wraps routes that should only be accessible after admin approval.
 * Unapproved users are redirected to their dashboard, where AccessBanner
 * explains what they need to do. A one-time toast nudges them.
 *
 * Usage in App.jsx:
 *   <Route path="find-work" element={
 *     <RequireApproved>
 *       <FindWork />
 *     </RequireApproved>
 *   } />
 */
export default function RequireApproved({ children }) {
  const { user } = useSelector((s) => s.auth);
  const allowed = canAccessFeatures(user);
  const state = getAccessState(user);

  useEffect(() => {
    if (!user || allowed) return;
    const messages = {
      incomplete: 'Please complete your profile first.',
      pending:    "Awaiting admin approval — you'll unlock this once approved.",
      rejected:   'This account is not approved for platform access.',
      suspended:  'Your account is suspended.',
    };
    toast.error(messages[state] || 'Access restricted.', { id: 'access-gate' });
  }, [user, allowed, state]);

  if (!user) return null; // ProtectedRoute handles this case upstream
  if (!allowed) {
    const fallback = ROLE_THEME[user.role]?.defaultPath || '/login';
    return <Navigate to={fallback} replace />;
  }
  return children;
}