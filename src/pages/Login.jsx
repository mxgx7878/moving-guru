import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../store/slices/authSlice';
import { loginUser } from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';
import { Eye, EyeOff, Globe, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  useEffect(() => {
    if (token) navigate('/portal/dashboard');
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex font-['DM_Sans']">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CE4F56] via-[#CE4F56]/90 to-[#E89560]" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #f5fca6 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #2DA4D6 0%, transparent 50%)`
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white/10" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full border-2 border-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <img src={logo} alt="Moving Guru Logo" height={80} width={80} />
            <span className="font-['Unbounded'] text-lg font-bold text-white/70 tracking-wider">
              MOVING GURU
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-white/50 tracking-widest uppercase mb-4">Global Wellness Network</p>
          <h1 className="font-['Unbounded'] text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            YOUR WORLD.<br />YOUR WORK.<br />
            <span className="text-[#f5fca6]">EVERYWHERE.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Connect with studios globally. Travel, teach, and grow your wellness career without limits.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-white">200+</p>
            <p className="text-xs text-white/50 mt-1">Studios</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-white">50+</p>
            <p className="text-xs text-white/50 mt-1">Countries</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-white">1k+</p>
            <p className="text-xs text-white/50 mt-1">Instructors</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Globe size={18} className="text-[#CE4F56]" />
            <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
              MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-2">Welcome back</h2>
            <p className="text-[#9A9A94] text-sm">Sign in to your member portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-[#3E3D38] text-sm placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all pr-10"
                  placeholder="••••••••"
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

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CE4F56] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#b8454c] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-4">
            <Link to="/forgot-password" className="text-[#9A9A94] text-xs hover:text-[#CE4F56] transition-colors">
              Forgot your password?
            </Link>
          </p>

          <p className="text-center text-[#9A9A94] text-sm mt-4">
            New to Moving Guru?{' '}
            <Link to="/register" className="text-[#CE4F56] font-medium hover:underline">
              Create account
            </Link>
          </p>

          <p className="text-center mt-6">
            <a href="/" className="text-[#C4BCB4] text-xs hover:text-[#9A9A94] transition-colors">
              &larr; Back to website
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
