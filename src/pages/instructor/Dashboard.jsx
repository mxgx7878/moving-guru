import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyApplications } from '../../store/actions/jobAction';
import { BarChart, StatCard, Button, Input } from '../../components/ui';
import { ChangePasswordCard, PasswordResetCard } from '../../features/account';
import {
  Eye, MessageCircle, Heart, TrendingUp, Globe,
  MapPin, Calendar, Star, ArrowUpRight, Zap, Megaphone,
  Mail, Settings,
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myApplications } = useSelector((s) => s.job);
  const profileData = user || {};

  useEffect(() => { dispatch(fetchMyApplications()); }, [dispatch]);

  const viewsArray = profileData.profileViews || [];
  const totalViews = profileData.profile_views || viewsArray.reduce((s, d) => s + d.views, 0) || 0;
  const thisMonth = viewsArray[viewsArray.length - 1]?.views || 0;
  const lastMonth = viewsArray[viewsArray.length - 2]?.views || 0;
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  const pendingApps = myApplications.filter((a) => a.status === 'pending' || a.status === 'viewed').length;
  const favouritedCount = profileData.saved_by_count ?? profileData.stats?.saved_by_count ?? 0;

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
          <h1 className="font-unbounded text-2xl font-black text-[#3E3D38] mb-1">
            {profileData.name?.split(' ')[0]}
          </h1>
          <p className="text-[#6B6B66] text-sm">
            {(profileData.profileStatus || profileData.profile_status) === 'active'
              ? 'Your profile is live and attracting studios'
              : 'Your profile is currently inactive'}
          </p>
          {(profileData.id || profileData.user_id) && (
            <Link
              to={`/portal/instructors/${profileData.id || profileData.user_id}`}
              className="mt-3 inline-flex items-center gap-1.5 bg-[#CE4F56] text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-[#b8444a] transition-colors"
            >
              <Eye size={12} /> View Profile
            </Link>
          )}
        </div>
        <div className="relative z-10 hidden sm:flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
            ${(profileData.profileStatus || profileData.profile_status) === 'active'
              ? 'bg-[#6BE6A4]/20 text-[#3E3D38]'
              : 'bg-[#FBF8E4] text-[#9A9A94]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${(profileData.profileStatus || profileData.profile_status) === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
            {(profileData.profileStatus || profileData.profile_status) === 'active' ? 'Actively Seeking' : 'Not Seeking'}
          </div>
          <p className="text-[#9A9A94] text-xs">
            {profileData.subscription?.charAt(0).toUpperCase() + profileData.subscription?.slice(1)} Plan
          </p>
        </div>
      </div>

      {/* Stats grid — all values come from the store */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Profile Views" value={thisMonth} sub="This month" color="coral" trend={growth > 0 ? growth : null} />
        <StatCard icon={TrendingUp} label="Total Views" value={totalViews} sub="All time" color="default" />
        <StatCard icon={MessageCircle} label="Active Apps" value={pendingApps} sub={`${myApplications.length} total`} color="orange" />
        <StatCard icon={Heart} label="Favourited" value={favouritedCount} sub="Times saved by studios" color="default" />
      </div>

      {/* Chart + Quick info */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E0D8]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Profile Views</h3>
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
          <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Profile Snapshot</h3>

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
                    <span className="text-[10px] bg-[#FBF8E4] text-[#9A9A94] px-2 py-0.5 rounded-full">
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
            <p className="font-unbounded text-sm font-bold text-white">Post on GROW</p>
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
            <p className="font-unbounded text-sm font-bold text-white">Boost your profile</p>
            <p className="text-white/60 text-xs mt-0.5">Get featured at the top of search results for $10/week</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          iconRight={ArrowUpRight}
          className="bg-white text-orange-mg border-white hover:bg-white/90 whitespace-nowrap"
        >
          Boost
        </Button>
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
            <h2 className="font-unbounded text-base font-black text-[#3E3D38]">Account Settings</h2>
            <p className="text-[#9A9A94] text-xs mt-0.5">Manage your email, password, and security</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
              <Mail size={14} className="text-[#CE4F56]" />
              <h3 className="font-unbounded text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Email Address</h3>
            </div>
            <div className="p-5">
              <div>
                <Input type="email" label="Email" value={user?.email || ''} disabled />
              </div>
            </div>
          </div>

          {/* Password reset (self-serve) */}
          <PasswordResetCard />
        </div>

        {/* Change Password — full width */}
        <div className="mt-4">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
