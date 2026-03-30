import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user, token, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  if (!user && status === STATUS.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <div className="w-8 h-8 border-3 border-[#CE4F56]/30 border-t-[#CE4F56] rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
