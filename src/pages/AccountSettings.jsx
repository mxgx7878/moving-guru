import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Mail, Lock, Check, Eye, EyeOff } from 'lucide-react';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSave = () => {
    if (!email.trim()) return;
    updateUser({ email });
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
  };

  const handlePasswordSave = () => {
    setError('');
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handlePasswordReset = () => {
    setResetSent(true);
    setTimeout(() => setResetSent(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Account Settings</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Manage your email, password, and security</p>
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CE4F56]/10 rounded-lg flex items-center justify-center">
            <Mail size={15} className="text-[#CE4F56]" />
          </div>
          <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Email Address</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B6B66] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#CE4F56] bg-[#FDFCF8] text-[#3E3D38]"
            />
          </div>
          <button
            onClick={handleEmailSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
              ${emailSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#CE4F56] text-white hover:bg-[#b8454c]'
              }`}
          >
            {emailSaved ? <><Check size={15} /> Saved!</> : 'Update Email'}
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CE4F56]/10 rounded-lg flex items-center justify-center">
            <Lock size={15} className="text-[#CE4F56]" />
          </div>
          <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Change Password</h3>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#6B6B66] uppercase tracking-wider mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#CE4F56] bg-[#FDFCF8] text-[#3E3D38] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B66] uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#CE4F56] bg-[#FDFCF8] text-[#3E3D38] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6B66] uppercase tracking-wider mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#CE4F56] bg-[#FDFCF8] text-[#3E3D38] pr-10"
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

          <button
            onClick={handlePasswordSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
              ${passwordSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#CE4F56] text-white hover:bg-[#b8454c]'
              }`}
          >
            {passwordSaved ? <><Check size={15} /> Password Updated!</> : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E89560]/10 rounded-lg flex items-center justify-center">
            <Settings size={15} className="text-[#E89560]" />
          </div>
          <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Password Reset</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#6B6B66] mb-4">
            Forgot your password? We'll send a reset link to your email address.
          </p>
          {resetSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              <p className="text-emerald-700 text-sm font-medium">Reset link sent to {user?.email}</p>
            </div>
          ) : (
            <button
              onClick={handlePasswordReset}
              className="px-5 py-2.5 rounded-xl font-bold text-sm border border-[#E5E0D8] text-[#6B6B66] hover:border-[#CE4F56] hover:text-[#CE4F56] transition-all"
            >
              Send Password Reset Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
