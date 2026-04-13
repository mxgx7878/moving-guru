import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../../store/slices/authSlice';
import { loginUser } from '../../store/actions/authAction';
import { STATUS, ROLES } from '../../constants/apiConstants';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token, user } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  // Role-based redirect after login
  useEffect(() => {
    if (token && user) {
      if (user.role === ROLES.STUDIO) {
        navigate('/studio/dashboard');
      } else {
        navigate('/portal/dashboard');
      }
    }
  }, [token, user, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-[#FBF8E4] flex font-['DM_Sans']">
      {/* ─────────────  Left panel — branded, image-free  ─────────────
          Previously this panel duplicated the "MOVING GURU" wordmark
          and used heavy decorative imagery. The client asked us to
          lead with the circle logo and remove the double title /
          stock-style backdrop. */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-[#f5fca6]">
        {/* Soft decorative shapes — no photographs */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#6BE6A4]/30" />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/40" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-[#7FFF00]/30" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Big circle logo — sole hero element */}
          <img
            src={logo}
            alt="Moving Guru"
            className="w-64 h-64 object-contain drop-shadow-sm"
          />
          <p className="font-['Unbounded'] text-[#3E3D38] text-base font-bold tracking-[0.4em] mt-6">
            MOVING&nbsp;GURU
          </p>
          <p className="text-[#3E3D38]/70 text-xs tracking-widest uppercase mt-2">
            Global Wellness Network
          </p>
        </div>
      </div>

      {/* ─────────────  Right panel — sign in  ───────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo (no duplicate wordmark on desktop) */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <img src={logo} alt="Moving Guru" className="w-24 h-24 object-contain" />
          </div>

          <h2 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-6 text-center lg:text-left">
            Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#3E3D38] text-xs font-semibold tracking-wider uppercase mb-2">Email</label>
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
              <label className="block text-[#3E3D38] text-xs font-semibold tracking-wider uppercase mb-2">Password</label>
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

          {/* Sign-up — buttons only, no email blurb */}
          <div className="border-t border-[#E5E0D8] mt-6 pt-6 space-y-3">
            <Link to="/register"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#CE4F56] text-[#CE4F56] rounded-xl text-sm font-semibold hover:bg-[#CE4F56] hover:text-white transition-all">
              Join as Instructor
            </Link>
            <Link to="/register"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#2DA4D6] text-[#2DA4D6] rounded-xl text-sm font-semibold hover:bg-[#2DA4D6] hover:text-white transition-all">
              Join as Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
