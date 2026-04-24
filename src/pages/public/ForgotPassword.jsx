import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Globe, ArrowRight, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { clearError, clearMessage } from '../../store/slices/authSlice';
import { forgotPassword } from '../../store/actions/authAction';
import { STATUS } from '../../constants/apiConstants';
import { Button, RHFInput } from '../../components/ui';
import { forgotPasswordSchema } from '../../features/forms';

export default function ForgotPassword() {
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const loading = status === STATUS.LOADING;

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => () => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  const onSubmit = async ({ email }) => {
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSubmittedEmail(email);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center font-dm p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Globe size={18} className="text-coral" />
          <span className="font-unbounded text-sm font-bold text-ink tracking-wider">
            MOVING <em className="not-italic text-coral">GURU</em>
          </span>
        </div>

        {submittedEmail ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h2 className="font-unbounded text-xl font-black text-ink mb-2">Check your email</h2>
            <p className="text-ink-soft text-sm mb-1">We sent a password reset link to</p>
            <p className="text-ink text-sm font-semibold mb-6">{submittedEmail}</p>
            <p className="text-ink-soft text-xs mb-6">
              Didn&apos;t receive the email? Check your spam folder or
            </p>
            <button
              type="button"
              onClick={() => { setSubmittedEmail(null); reset(); dispatch(clearMessage()); }}
              className="text-coral text-sm font-medium hover:underline"
            >
              Try another email address
            </button>
            <div className="mt-8">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-ink-soft text-sm hover:text-ink transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-unbounded text-2xl font-black text-ink mb-2">Forgot password?</h2>
              <p className="text-ink-soft text-sm">
                No worries, we&apos;ll send you a reset link to your email.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <RHFInput
                control={control}
                errors={errors}
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                iconLeft={<Mail size={14} />}
                autoComplete="email"
              />

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl" role="alert">
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                iconRight={ArrowRight}
              >
                Send Reset Link
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
          </>
        )}
      </div>
    </div>
  );
}
