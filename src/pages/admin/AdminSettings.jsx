import { useState } from 'react';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, Lock, Mail, Check } from 'lucide-react';
import { changePassword, forgotPassword } from '../../store/actions/authAction';
import { Input, Button } from '../../components/ui';

// Admin personal settings: change password, reset password email. Kept
// minimal — platform-level configuration (feature flags, global limits)
// can be added here later when the backend exposes those endpoints.
export default function AdminSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [current, setCurrent] = useState('');
  const [next, setNext]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess(false);
    if (!current) return setPwError('Enter your current password.');
    if (next.length < 6) return setPwError('New password must be at least 6 characters.');
    if (next !== confirm) return setPwError('Passwords do not match.');

    setPwLoading(true);
    const res = await dispatch(changePassword({
      current_password: current,
      password: next,
      password_confirmation: confirm,
    }));
    setPwLoading(false);

    if (changePassword.fulfilled.match(res)) {
      toast.success('Password updated.');
      setPwSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError(res.payload || 'Could not update password.');
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    const res = await dispatch(forgotPassword({ email: user?.email }));
    setResetLoading(false);
    if (forgotPassword.fulfilled.match(res)) {
      setResetSuccess(true);
      toast.success(`Reset link sent to ${user?.email}`);
      setTimeout(() => setResetSuccess(false), 4000);
    } else {
      toast.error(res.payload || 'Could not send reset link.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#7F77DD]/10 rounded-2xl flex items-center justify-center">
          <Settings size={22} className="text-[#7F77DD]" />
        </div>
        <div>
          <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-1">
            Admin &nbsp;/&nbsp; Settings
          </p>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Account &amp; Security</h1>
          <p className="text-[#6B6B66] text-xs mt-0.5">
            Manage your personal admin credentials.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
            <Mail size={14} className="text-[#2DA4D6]" />
            <h3 className="font-unbounded text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Email</h3>
          </div>
          <div className="p-5 space-y-3">
            <Input label="Admin email" value={user?.email || ''} disabled />
            <p className="text-[10px] text-[#9A9A94]">To change your admin email, contact the platform owner.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
            <Settings size={14} className="text-[#E89560]" />
            <h3 className="font-unbounded text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Password Reset</h3>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-[#6B6B66]">Send a reset link to your email if you've forgotten your password.</p>
            {resetSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Check size={13} className="text-emerald-600" />
                <p className="text-emerald-700 text-xs font-medium">Reset link sent to {user?.email}</p>
              </div>
            )}
            {!resetSuccess && (
              <Button variant="secondary" loading={resetLoading} onClick={handleReset}>
                Send Reset Link
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
          <Lock size={14} className="text-[#7F77DD]" />
          <h3 className="font-unbounded text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Change Password</h3>
        </div>
        <div className="p-5 space-y-4">
          {pwError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Check size={13} className="text-emerald-600" />
              <p className="text-emerald-700 text-xs font-medium">Password updated.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} disabled={pwLoading} />
            <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Min. 6 characters" disabled={pwLoading} />
            <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" disabled={pwLoading} />
          </div>
          <Button
            variant={pwSuccess ? 'success' : 'primary'}
            icon={pwSuccess ? Check : undefined}
            loading={pwLoading}
            onClick={handleChangePassword}
          >
            {pwSuccess ? 'Password Updated!' : 'Update Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
