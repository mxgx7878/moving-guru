import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Settings } from 'lucide-react';

import { Button } from '../../components/ui';
import { forgotPassword } from '../../store/actions/authAction';

// Simple single-action card that fires a password-reset email to the
// signed-in user. No form fields, so it doesn't need RHF.
export default function PasswordResetCard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    setErrorMsg('');
    setSuccess(false);
    setLoading(true);
    const result = await dispatch(forgotPassword({ email: user?.email }));
    setLoading(false);
    if (forgotPassword.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setErrorMsg(result.payload || 'Failed to send reset link.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-edge overflow-hidden">
      <div className="px-5 py-3.5 border-b border-edge flex items-center gap-2.5">
        <Settings size={14} className="text-orange-mg" />
        <h3 className="font-unbounded text-[10px] font-bold text-ink tracking-wider uppercase">
          Password Reset
        </h3>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-ink-muted">
          Forgot your password? We'll send a reset link to your email.
        </p>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2" role="status">
            <Check size={13} className="text-emerald-600" />
            <p className="text-emerald-700 text-xs font-medium">Reset link sent to {user?.email}</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5" role="alert">
            <p className="text-red-600 text-xs">{errorMsg}</p>
          </div>
        )}

        {!success && (
          <Button variant="secondary" size="sm" loading={loading} onClick={handleReset}
            className="hover:border-sky-mg hover:text-sky-mg">
            Send Password Reset Link
          </Button>
        )}
      </div>
    </div>
  );
}
