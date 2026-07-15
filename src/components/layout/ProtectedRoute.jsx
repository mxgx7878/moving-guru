import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { ROLE_THEME } from '../../config/portalConfig';

/**
 * Centralized ProtectedRoute for all portals.
 *
 * Usage in App.jsx:
 *   <ProtectedRoute allowedRoles={['instructor']}>...</ProtectedRoute>
 *   <ProtectedRoute allowedRoles={['studio']}>...</ProtectedRoute>
 *   <ProtectedRoute allowedRoles={['admin']}>...</ProtectedRoute>
 *
 * If no allowedRoles passed → any authenticated user is allowed through.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token, status } = useSelector((s) => s.auth);

  // Only kick off validation when we're genuinely idle — otherwise StrictMode
  // and re-renders can re-dispatch while a request is already in flight.
  useEffect(() => {
    if (token && !user && status === STATUS.IDLE) {
      dispatch(getMe());
    }
  }, [token, user, status, dispatch]);

  // Not authenticated
  if (!token) return <Navigate to="/login" replace />;

  // Token present but user not yet known
  if (!user) {
    if (status === STATUS.IDLE || status === STATUS.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      );
    }
    // Validation finished but no user (stale / foreign token, bad response) →
    // force a clean login instead of crashing inside the portal layout.
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to correct portal
  if (
    user.role !== 'admin'
    && user.status === 'pending_payment'
    && location.pathname !== '/checkout'
  ) {
    return <Navigate to="/checkout" replace />;
  }

  if (location.pathname === '/checkout' && user.status !== 'pending_payment') {
    return <Navigate to={ROLE_THEME[user.role]?.defaultPath || '/login'} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.status === 'pending_payment' && user.role !== 'admin') {
      return <Navigate to="/checkout" replace />;
    }
    return <Navigate to={ROLE_THEME[user.role]?.defaultPath || '/login'} replace />;
  }

  return children;
}