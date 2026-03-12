import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Globe, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('bambi@movingguru.co');
  const [password, setPassword] = useState('demo123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/portal/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex font-['DM_Sans']">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4f53c] via-[#b8e030] to-[#8fba20]" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #e8834a 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #2da4d6 0%, transparent 50%)`
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-black/10" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full border-2 border-black/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={20} className="text-black/60" />
            <span className="font-['Unbounded'] text-sm font-bold text-black/60 tracking-wider">
              MOVING GURU
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-black/50 tracking-widest uppercase mb-4">Global Wellness Network</p>
          <h1 className="font-['Unbounded'] text-4xl xl:text-5xl font-black text-black leading-tight mb-6">
            YOUR WORLD.<br />YOUR WORK.<br />
            <span className="text-black/40">EVERYWHERE.</span>
          </h1>
          <p className="text-black/60 text-base leading-relaxed max-w-xs">
            Connect with studios globally. Travel, teach, and grow your wellness career without limits.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-black">200+</p>
            <p className="text-xs text-black/50 mt-1">Studios</p>
          </div>
          <div className="w-px h-8 bg-black/20" />
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-black">50+</p>
            <p className="text-xs text-black/50 mt-1">Countries</p>
          </div>
          <div className="w-px h-8 bg-black/20" />
          <div className="text-center">
            <p className="font-['Unbounded'] text-2xl font-black text-black">1k+</p>
            <p className="text-xs text-black/50 mt-1">Instructors</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Globe size={18} className="text-[#d4f53c]" />
            <span className="font-['Unbounded'] text-sm font-bold text-white tracking-wider">
              MOVING <em className="not-italic text-[#d4f53c]">GURU</em>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-['Unbounded'] text-2xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-white/40 text-sm">Sign in to your member portal</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 px-4 py-3 bg-[#d4f53c]/10 border border-[#d4f53c]/20 rounded-xl">
            <p className="text-[#d4f53c] text-xs font-medium">
              🎯 Demo: <span className="opacity-70">bambi@movingguru.co / demo123</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-medium tracking-wider uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#d4f53c]/50 focus:bg-white/10 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium tracking-wider uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#d4f53c]/50 focus:bg-white/10 transition-all pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4f53c] text-black font-bold text-sm py-3.5 rounded-xl hover:bg-[#c4e530] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            New to Moving Guru?{' '}
            <Link to="/register" className="text-[#d4f53c] font-medium hover:underline">
              Create account
            </Link>
          </p>

          <p className="text-center mt-6">
            <a href="/" className="text-white/20 text-xs hover:text-white/40 transition-colors">
              ← Back to website
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
