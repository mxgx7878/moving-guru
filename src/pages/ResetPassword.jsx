import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearMessage } from '../store/slices/authSlice';
import { resetPassword } from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';
import { Globe, ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(resetPassword({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }));
    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-['DM_Sans'] p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Globe size={18} className="text-[#CE4F56]" />
            <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
              MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
            </span>
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="font-['Unbounded'] text-xl font-black text-[#3E3D38] mb-2">Password reset!</h2>
          <p className="text-[#9A9A94] text-sm mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#CE4F56] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#b8454c] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Sign In <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-['DM_Sans'] p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Globe size={18} className="text-[#CE4F56]" />
          <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
            MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
          </span>
        </div>

        <div className="mb-6">
          <h2 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-2">Set new password</h2>
          <p className="text-[#9A9A94] text-sm">
            Your new password must be at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4BCB4]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-10 pr-10 py-3 text-[#3E3D38] text-sm placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all"
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4BCB4]" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-10 pr-10 py-3 text-[#3E3D38] text-sm placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all"
                placeholder="Repeat new password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CE4F56] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#b8454c] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Reset Password <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-[#9A9A94] text-sm hover:text-[#3E3D38] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
