import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changePassword, forgotPassword } from '../store/actions/authAction';
import { DUMMY_USER } from '../data/dummyData';
import BarChart from '../components/BarChart';
import StatCard from '../components/StatCard';
import {
  Eye, MessageCircle, Heart, TrendingUp, Globe,
  MapPin, Calendar, Star, ArrowUpRight, Zap, Megaphone,
  Mail, Lock, Settings, Check, EyeOff
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const profileData = user || DUMMY_USER;

  // API returns profile_views as a number; DUMMY_USER may have profileViews array
  const viewsArray = profileData.profileViews || [];
  const totalViews = profileData.profile_views || viewsArray.reduce((s, d) => s + d.views, 0) || 0;
  const thisMonth = viewsArray[viewsArray.length - 1]?.views || 0;
  const lastMonth = viewsArray[viewsArray.length - 2]?.views || 0;
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  // Account settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Change password states
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Reset link states
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handlePasswordSave = async () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPassword) { setPwError('Please enter your current password'); return; }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }

    setPwLoading(true);
    const result = await dispatch(changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    }));
    setPwLoading(false);

    if (changePassword.fulfilled.match(result)) {
      setPwSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError(result.payload || 'Failed to update password. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    setResetError('');
    setResetSuccess(false);
    setResetLoading(true);

    const result = await dispatch(forgotPassword({ email: user?.email }));
    setResetLoading(false);

    if (forgotPassword.fulfilled.match(result)) {
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } else {
      setResetError(result.payload || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/40 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative border border-[#E5E0D8]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, #CE4F56 0%, transparent 60%)`
          }}
        />
        <div className="relative z-10">
          <p className="text-[#CE4F56] text-xs font-semibold tracking-widest uppercase mb-2">Welcome back</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
            {profileData.name?.split(' ')[0]}
          </h1>
          <p className="text-[#6B6B66] text-sm">
            {(profileData.profileStatus || profileData.profile_status) === 'active'
              ? 'Your profile is live and attracting studios'
              : 'Your profile is currently inactive'}
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
            ${(profileData.profileStatus || profileData.profile_status) === 'active'
              ? 'bg-[#6BE6A4]/20 text-[#3E3D38]'
              : 'bg-[#EDE8DF] text-[#9A9A94]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${(profileData.profileStatus || profileData.profile_status) === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
            {(profileData.profileStatus || profileData.profile_status) === 'active' ? 'Actively Seeking' : 'Not Seeking'}
          </div>
          <p className="text-[#9A9A94] text-xs">
            {profileData.subscription?.charAt(0).toUpperCase() + profileData.subscription?.slice(1)} Plan
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Profile Views" value={thisMonth} sub="This month" color="coral" trend={growth > 0 ? growth : null} />
        <StatCard icon={TrendingUp} label="Total Views" value={totalViews} sub="All time" color="default" />
        <StatCard icon={MessageCircle} label="Messages" value="3" sub="Unread" color="orange" />
        <StatCard icon={Heart} label="Favourited" value="12" sub="Times saved" color="default" />
      </div>

      {/* Chart + Quick info */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E0D8]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">Profile Views</h3>
              <p className="text-xs text-[#9A9A94] mt-0.5">Monthly breakdown</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f5fca6]/50 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CE4F56]" />
              <span className="text-xs text-[#6B6B66]">Views</span>
            </div>
          </div>
          <BarChart data={profileData.profileViews || []} />
        </div>

        {/* Quick info */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] space-y-4">
          <h3 className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">Profile Snapshot</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-[#9A9A94] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider">Location</p>
                <p className="text-xs font-medium text-[#3E3D38]">{profileData.location || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe size={14} className="text-[#9A9A94] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider">Traveling To</p>
                <p className="text-xs font-medium text-[#3E3D38]">{profileData.travelingTo || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-[#9A9A94] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider">Availability</p>
                <p className="text-xs font-medium text-[#3E3D38]">{profileData.availability || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star size={14} className="text-[#9A9A94] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider">Disciplines</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(profileData.disciplines || []).slice(0, 3).map(d => (
                    <span key={d} className="text-[10px] bg-[#2DA4D6]/15 text-[#2DA4D6] px-2 py-0.5 rounded-full">{d}</span>
                  ))}
                  {(profileData.disciplines || []).length > 3 && (
                    <span className="text-[10px] bg-[#EDE8DF] text-[#9A9A94] px-2 py-0.5 rounded-full">
                      +{profileData.disciplines.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post on GROW banner */}
      <div className="bg-gradient-to-r from-[#2DA4D6] to-[#2DA4D6]/80 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <p className="font-['Unbounded'] text-sm font-bold text-white">Post on GROW</p>
            <p className="text-white/70 text-xs mt-0.5">Advertise your retreat, event, or training program here</p>
          </div>
        </div>
        <a href="/grow" className="bg-white text-[#2DA4D6] font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap flex items-center gap-1.5">
          Post Now <ArrowUpRight size={12} />
        </a>
      </div>

      {/* Boost banner */}
      <div className="bg-[#E89560] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-['Unbounded'] text-sm font-bold text-white">Boost your profile</p>
            <p className="text-white/60 text-xs mt-0.5">Get featured at the top of search results for $10/week</p>
          </div>
        </div>
        <button className="bg-white text-[#E89560] font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap flex items-center gap-1.5">
          Boost <ArrowUpRight size={12} />
        </button>
      </div>

      {/* ═══════════════════════════════════════
           ACCOUNT SETTINGS SECTION
         ═══════════════════════════════════════ */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#CE4F56]/10 rounded-xl flex items-center justify-center">
            <Settings size={16} className="text-[#CE4F56]" />
          </div>
          <div>
            <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">Account Settings</h2>
            <p className="text-[#9A9A94] text-xs mt-0.5">Manage your email, password, and security</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
              <Mail size={14} className="text-[#CE4F56]" />
              <h3 className="font-['Unbounded'] text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Email Address</h3>
            </div>
            <div className="p-5">
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-sm bg-[#EDE8DF]/50 text-[#9A9A94] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Password Reset */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
              <Settings size={14} className="text-[#E89560]" />
              <h3 className="font-['Unbounded'] text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Password Reset</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#6B6B66] mb-3">
                Forgot your password? We'll send a reset link to your email.
              </p>

              {resetSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Check size={13} className="text-emerald-600" />
                  <p className="text-emerald-700 text-xs font-medium">Reset link sent to {user?.email}</p>
                </div>
              )}

              {resetError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3">
                  <p className="text-red-600 text-xs">{resetError}</p>
                </div>
              )}

              {!resetSuccess && (
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-xl font-bold text-xs border border-[#E5E0D8] text-[#6B6B66] hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resetLoading ? (
                    <><div className="w-3 h-3 border-2 border-[#9A9A94]/30 border-t-[#9A9A94] rounded-full animate-spin" /> Sending...</>
                  ) : (
                    'Send Password Reset Link'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Change Password — full width */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden mt-4">
          <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
            <Lock size={14} className="text-[#CE4F56]" />
            <h3 className="font-['Unbounded'] text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Change Password</h3>
          </div>
          <div className="p-5 space-y-3">
            {pwError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600">
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Check size={13} className="text-emerald-600" />
                <p className="text-emerald-700 text-xs font-medium">Password updated successfully!</p>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] uppercase tracking-wider mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Current"
                    disabled={pwLoading}
                    className="w-full border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2DA4D6] bg-[#FDFCF8] text-[#3E3D38] pr-9 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]">
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    disabled={pwLoading}
                    className="w-full border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2DA4D6] bg-[#FDFCF8] text-[#3E3D38] pr-9 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9A9A94] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    disabled={pwLoading}
                    className="w-full border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2DA4D6] bg-[#FDFCF8] text-[#3E3D38] pr-9 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handlePasswordSave}
              disabled={pwLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                ${pwSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#2DA4D6] text-white hover:bg-[#2590bd]'
                }`}
            >
              {pwLoading ? (
                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
              ) : pwSuccess ? (
                <><Check size={13} /> Password Updated!</>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
