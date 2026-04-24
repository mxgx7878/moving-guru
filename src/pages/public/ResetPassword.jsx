import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Globe, ArrowRight, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

import { clearError, clearMessage } from '../../store/slices/authSlice';
import { resetPassword } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { Button, RHFInput } from '../../components/ui';
import { resetPasswordSchema } from '../../features/forms';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token      = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  useEffect(() => () => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  const onSubmit = async (values) => {
    const result = await dispatch(resetPassword({
      token,
      email: emailParam,
      ...values,
    }));
    if (resetPassword.fulfilled.match(result)) setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center font-dm p-6">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Globe size={18} className="text-coral" />
            <span className="font-unbounded text-sm font-bold text-ink tracking-wider">
              MOVING <em className="not-italic text-coral">GURU</em>
            </span>
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="font-unbounded text-xl font-black text-ink mb-2">Password reset!</h2>
          <p className="text-ink-soft text-sm mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Button variant="primary" size="lg" fullWidth iconRight={ArrowRight}
            onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center font-dm p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Globe size={18} className="text-coral" />
          <span className="font-unbounded text-sm font-bold text-ink tracking-wider">
            MOVING <em className="not-italic text-coral">GURU</em>
          </span>
        </div>

        <div className="mb-6">
          <h2 className="font-unbounded text-2xl font-black text-ink mb-2">Set new password</h2>
          <p className="text-ink-soft text-sm">
            Your new password must be at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <RHFInput
            control={control}
            errors={errors}
            name="password"
            type="password"
            label="New Password"
            placeholder="Min. 6 characters"
            iconLeft={<Lock size={14} />}
            autoComplete="new-password"
          />
          <RHFInput
            control={control}
            errors={errors}
            name="password_confirmation"
            type="password"
            label="Confirm Password"
            placeholder="Repeat new password"
            iconLeft={<Lock size={14} />}
            autoComplete="new-password"
          />

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} iconRight={ArrowRight}>
            Reset Password
          </Button>
        </form>

        <div className="mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-ink-soft text-sm hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
