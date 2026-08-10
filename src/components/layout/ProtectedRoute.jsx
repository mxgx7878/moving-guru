import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { ROLE_THEME } from '../../config/portalConfig';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token, status } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user && status === STATUS.IDLE) {
      dispatch(getMe());
    }
  }, [token, user, status, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  if (!user) {
    if (status === STATUS.IDLE || status === STATUS.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

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
