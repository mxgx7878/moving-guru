import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Globe, ArrowRight } from 'lucide-react';

import { clearError } from '../../store/slices/authSlice';
import { loginUser } from '../../store/actions/authAction';
import { STATUS, ROLES } from '../../constants/apiConstants';
import { Button, RHFInput } from '../../components/ui';
import { loginSchema } from '../../features/forms';
import logo from '../../assets/logo.png';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token, user } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Role-based redirect after login
  useEffect(() => {
    if (token && user) {
      navigate(user.role === ROLES.STUDIO ? '/studio/dashboard' : '/portal/dashboard');
    }
  }, [token, user, navigate]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = (values) => {
    dispatch(loginUser(values));
  };

  return (
    <div className="min-h-screen bg-warm-bg flex font-dm">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-coral via-coral/90 to-orange-mg" />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #f5fca6 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #2DA4D6 0%, transparent 50%)`,
          }}
        />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-white/10" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full border-2 border-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <img src={logo} alt="Moving Guru Logo" height={80} width={80} />
            <span className="font-unbounded text-lg font-bold text-white/70 tracking-wider">
              MOVING GURU
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-white/50 tracking-widest uppercase mb-4">Global Wellness Network</p>
          <h1 className="font-unbounded text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            YOUR WORLD.<br />YOUR WORK.<br />
            <span className="text-lime">EVERYWHERE.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Connect with studios globally. Travel, teach, and grow your wellness career without limits.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <p className="font-unbounded text-2xl font-black text-white">50+</p>
            <p className="text-white/50 text-xs">Countries</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="font-unbounded text-2xl font-black text-white">1000+</p>
            <p className="text-white/50 text-xs">Instructors</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="font-unbounded text-2xl font-black text-white">200+</p>
            <p className="text-white/50 text-xs">Studios</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Globe size={18} className="text-coral" />
            <span className="font-unbounded text-sm font-bold text-ink tracking-wider">
              MOVING <em className="not-italic text-coral">GURU</em>
            </span>
          </div>

          <h2 className="font-unbounded text-2xl font-black text-ink mb-1">Welcome back</h2>
          <p className="text-ink-soft text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <RHFInput
              control={control}
              errors={errors}
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <RHFInput
              control={control}
              errors={errors}
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="danger"
              size="lg"
              fullWidth
              loading={loading}
              iconRight={ArrowRight}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-4">
            <Link to="/forgot-password" className="text-ink-soft text-xs hover:text-coral transition-colors">
              Forgot your password?
            </Link>
          </p>

          <div className="border-t border-edge mt-6 pt-6 space-y-3">
            <p className="text-center text-ink-soft text-sm">New to Moving Guru?</p>
            <Link to="/register">
              <Button variant="outlineDanger" size="md" fullWidth className="border-2">
                Join as Instructor
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="border-2 border-sky-mg text-sky-mg hover:bg-sky-mg hover:text-white"
              >
                Join as Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
