import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../constants/apiConstants';

export default function RoleRedirect() {
  const { token, user } = useSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  if (!user) return null; // wait for getMe

  if (user.role === ROLES.STUDIO) {
    return <Navigate to="/studio/dashboard" replace />;
  }

  return <Navigate to="/portal/dashboard" replace />;
}