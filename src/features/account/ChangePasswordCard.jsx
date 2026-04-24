import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Check, Lock } from 'lucide-react';

import { Button, RHFInput } from '../../components/ui';
import { changePassword } from '../../store/actions/authAction';
import { changePasswordSchema } from '../forms';

// Shared "Change password" card used by both the instructor and studio
// dashboards (previously duplicated in full). Uses yup + RHF for
// validation so the caller only wires the card into its settings grid.
export default function ChangePasswordCard() {
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    control, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setSuccess(false);
    const result = await dispatch(changePassword(values));
    if (changePassword.fulfilled.match(result)) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setServerError(result.payload || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-edge overflow-hidden">
      <div className="px-5 py-3.5 border-b border-edge flex items-center gap-2.5">
        <Lock size={14} className="text-coral" />
        <h3 className="font-unbounded text-[10px] font-bold text-ink tracking-wider uppercase">
          Change Password
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600" role="alert">
            {serverError}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2" role="status">
            <Check size={13} className="text-emerald-600" />
            <p className="text-emerald-700 text-xs font-medium">Password updated successfully!</p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <RHFInput
            control={control}
            errors={errors}
            name="current_password"
            label="Current Password"
            type="password"
            placeholder="Current"
            accent="#2DA4D6"
          />
          <RHFInput
            control={control}
            errors={errors}
            name="password"
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            accent="#2DA4D6"
          />
          <RHFInput
            control={control}
            errors={errors}
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            placeholder="Repeat new password"
            accent="#2DA4D6"
          />
        </div>

        <Button
          type="submit"
          variant={success ? 'success' : 'primary'}
          size="sm"
          loading={isSubmitting}
          icon={success ? Check : undefined}
        >
          {success ? 'Password Updated!' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
