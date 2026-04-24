import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, MessageCircle, Heart, Eye, ArrowRight,
  MapPin, Star, Users, Building2, Mail,
} from 'lucide-react';
import { fetchInstructors, fetchSavedInstructors } from '../../store/actions/instructorAction';
import { fetchMyJobs } from '../../store/actions/jobAction';
import { CardSkeleton } from '../../components/feedback';
import { DashboardStatCard, Button, Avatar, Input } from '../../components/ui';
import { ChangePasswordCard, PasswordResetCard } from '../../features/account';

export default function StudioDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { instructors, savedIds, status } = useSelector((s) => s.instructor);
  const { myJobs } = useSelector((s) => s.job);
  const studioName = user?.studio_name || user?.studioName || user?.name || 'Studio';
  const recentInstructors = instructors.slice(0, 3);

  const totalApplicants = myJobs.reduce((n, j) => n + (j.applicants_count || 0), 0);
  const activeListings  = myJobs.filter((j) => j.is_active !== false).length;

  useEffect(() => {
    dispatch(fetchInstructors({ limit: 3 }));
    dispatch(fetchSavedInstructors());
    dispatch(fetchMyJobs());
  }, [dispatch]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#2DA4D6]/5 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative border border-[#E5E0D8]">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle at 85% 50%, #2DA4D6 0%, transparent 60%)` }} />
        <div className="relative z-10">
          <p className="text-[#2DA4D6] text-xs font-semibold tracking-widest uppercase mb-2">Studio Dashboard</p>
          <h1 className="font-unbounded text-2xl font-black text-[#3E3D38] mb-1">{studioName}</h1>
          <p className="text-[#6B6B66] text-sm">Find your next great instructor from the Moving Guru network</p>
        </div>
        <div className="relative z-10 hidden sm:block">
          <Button variant="primary" size="lg" icon={Search} className="shadow-sm"
            onClick={() => navigate('/studio/search')}>
            Find Instructors
          </Button>
        </div>
      </div>

      {/* Stats — pulled from the live store */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard icon={Eye}          label="Active Listings" value={activeListings}      sub={`${myJobs.length} total`}        color="blue" />
        <DashboardStatCard icon={MessageCircle} label="Applicants"     value={totalApplicants}     sub="Across your listings"           color="coral" />
        <DashboardStatCard icon={Heart}        label="Saved"           value={savedIds.length}     sub="Instructors in favourites"      color="green" />
        <DashboardStatCard icon={Users}        label="Network"         value={instructors.length}  sub="Active instructors on platform" color="default" />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={() => navigate('/studio/search')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#2DA4D6] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 bg-[#2DA4D6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2DA4D6]/20 transition-colors">
            <Search size={18} className="text-[#2DA4D6]" />
          </div>
          <p className="font-unbounded text-sm font-black text-[#3E3D38] mb-1">Find Instructors</p>
          <p className="text-[#9A9A94] text-xs">Browse and filter the global network</p>
          <div className="flex items-center gap-1 mt-3 text-[#2DA4D6] text-xs font-semibold">Search now <ArrowRight size={12} /></div>
        </button>
        <button onClick={() => navigate('/studio/messages')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#CE4F56] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 bg-[#CE4F56]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE4F56]/20 transition-colors">
            <MessageCircle size={18} className="text-[#CE4F56]" />
          </div>
          <p className="font-unbounded text-sm font-black text-[#3E3D38] mb-1">Messages</p>
          <p className="text-[#9A9A94] text-xs">3 unread conversations</p>
          <div className="flex items-center gap-1 mt-3 text-[#CE4F56] text-xs font-semibold">View inbox <ArrowRight size={12} /></div>
        </button>
        <button onClick={() => navigate('/studio/profile')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#E89560] hover:shadow-sm transition-all group">
          <div className="w-10 h-10 bg-[#E89560]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#E89560]/20 transition-colors">
            <Building2 size={18} className="text-[#E89560]" />
          </div>
          <p className="font-unbounded text-sm font-black text-[#3E3D38] mb-1">Studio Profile</p>
          <p className="text-[#9A9A94] text-xs">Update your studio details</p>
          <div className="flex items-center gap-1 mt-3 text-[#E89560] text-xs font-semibold">Edit profile <ArrowRight size={12} /></div>
        </button>
      </div>

      {/* Recently active instructors */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h3 className="font-unbounded text-sm font-black text-[#3E3D38]">Recently Active Instructors</h3>
            <p className="text-xs text-[#9A9A94] mt-0.5">Actively seeking opportunities now</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            iconRight={ArrowRight}
            onClick={() => navigate('/studio/search')}
            className="!text-sky-mg hover:!underline"
          >
            View all
          </Button>
        </div>
        {status === 'loading' && instructors.length === 0 ? (
          <div className="p-6"><CardSkeleton count={3} /></div>
        ) : (
          <div className="divide-y divide-[#E5E0D8]">
            {recentInstructors.map(inst => {
              const initials = inst.initials || inst.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={inst.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#FDFCF8] transition-colors group">
                 <Avatar
                   name={inst.name}
                   src={inst.detail?.profile_picture_url || inst.detail?.profile_picture}
                   size="md"
                   tone="coral"
                 />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3E3D38] text-sm font-semibold truncate">{inst.name}</p>
                    <p className="text-[#9A9A94] text-xs">{(inst.detail.disciplines || []).join(', ')}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-xs text-[#9A9A94]">
                    <MapPin size={11} />{inst.detail.location}
                  </div>
                  <div className="hidden lg:block">
                    <span className="px-2.5 py-1 bg-[#6BE6A4]/20 text-[#3E3D38] text-[10px] font-semibold rounded-full">
                      {inst.detail.availability}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => navigate('/studio/messages')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Message
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription nudge */}
      <div className="bg-[#f5fca6]/40 rounded-2xl p-5 border border-[#f5fca6] flex items-center gap-4">
        <div className="w-10 h-10 bg-[#f5fca6] rounded-xl flex items-center justify-center flex-shrink-0">
          <Star size={18} className="text-[#3E3D38]" />
        </div>
        <div className="flex-1">
          <p className="text-[#3E3D38] text-sm font-semibold">Launch Promo Active</p>
          <p className="text-[#6B6B66] text-xs mt-0.5">First 3 months for $2 — founding member pricing locked in forever</p>
        </div>
        <Button variant="ghost" size="xs" onClick={() => navigate('/studio/subscription')}
          className="!text-ink hover:!underline !font-bold flex-shrink-0">
          View plan
        </Button>
      </div>

      {/* ════════════════════════════════════════
           ACCOUNT SETTINGS
         ════════════════════════════════════════ */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#2DA4D6]/10 rounded-xl flex items-center justify-center">
            <Settings size={16} className="text-[#2DA4D6]" />
          </div>
          <div>
            <h2 className="font-unbounded text-base font-black text-[#3E3D38]">Account Settings</h2>
            <p className="text-[#9A9A94] text-xs mt-0.5">Manage your email, password, and security</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Email — read only */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-2.5">
              <Mail size={14} className="text-[#2DA4D6]" />
              <h3 className="font-unbounded text-[10px] font-bold text-[#3E3D38] tracking-wider uppercase">Email Address</h3>
            </div>
            <div className="p-5">
              <Input
                type="email"
                label="Email"
                value={user?.email || ''}
                disabled
                hint="To change your email, contact admin@movingguru.co"
              />
            </div>
          </div>

          {/* Password reset (self-serve) */}
          <PasswordResetCard />
        </div>

        {/* Change Password */}
        <div className="mt-4">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}