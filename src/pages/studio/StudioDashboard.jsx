import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, MessageCircle, Heart, Eye, ArrowRight,
  MapPin, Star, Users, Building2
} from 'lucide-react';
import { fetchInstructors } from '../../store/actions/instructorAction';
import { CardSkeleton } from '../../components/feedback';

function StatCard({ icon: Icon, label, value, sub, color = 'default' }) {
  const colors = {
    blue: { bg: 'bg-[#2DA4D6]/8', icon: 'text-[#2DA4D6]', val: 'text-[#2DA4D6]' },
    coral: { bg: 'bg-[#CE4F56]/8', icon: 'text-[#CE4F56]', val: 'text-[#CE4F56]' },
    green: { bg: 'bg-[#6BE6A4]/20', icon: 'text-[#3E3D38]', val: 'text-[#3E3D38]' },
    default: { bg: 'bg-white', icon: 'text-[#9A9A94]', val: 'text-[#3E3D38]' },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-[#E5E0D8]`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm">
          <Icon size={16} className={c.icon} />
        </div>
      </div>
      <p className={`font-['Unbounded'] text-2xl font-black ${c.val}`}>{value}</p>
      <p className="text-[#3E3D38] text-xs font-semibold mt-1">{label}</p>
      {sub && <p className="text-[#9A9A94] text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StudioDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { instructors, status } = useSelector((s) => s.instructor);
  const studioName = user?.studio_name || user?.studioName || user?.name || 'Studio';

  useEffect(() => {
    dispatch(fetchInstructors({ limit: 3 }));
  }, [dispatch]);

  const recentInstructors = instructors.slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#2DA4D6]/5 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative border border-[#E5E0D8]">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle at 85% 50%, #2DA4D6 0%, transparent 60%)` }}
        />
        <div className="relative z-10">
          <p className="text-[#2DA4D6] text-xs font-semibold tracking-widest uppercase mb-2">Studio Dashboard</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
            {studioName}
          </h1>
          <p className="text-[#6B6B66] text-sm">Find your next great instructor from the Moving Guru network</p>
        </div>
        <div className="relative z-10 hidden sm:block">
          <button
            onClick={() => navigate('/studio/search')}
            className="flex items-center gap-2 px-5 py-3 bg-[#2DA4D6] text-white rounded-xl text-sm font-bold hover:bg-[#2590bd] transition-all shadow-sm"
          >
            <Search size={16} /> Find Instructors
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Profile Views" value="24" sub="This month" color="blue" />
        <StatCard icon={MessageCircle} label="Messages" value="3" sub="Unread" color="coral" />
        <StatCard icon={Heart} label="Saved" value="8" sub="Instructors saved" color="green" />
        <StatCard icon={Users} label="Network" value="1,200+" sub="Active instructors" color="default" />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/studio/search')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#2DA4D6] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 bg-[#2DA4D6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2DA4D6]/20 transition-colors">
            <Search size={18} className="text-[#2DA4D6]" />
          </div>
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">Find Instructors</p>
          <p className="text-[#9A9A94] text-xs">Browse and filter the global network</p>
          <div className="flex items-center gap-1 mt-3 text-[#2DA4D6] text-xs font-semibold">
            Search now <ArrowRight size={12} />
          </div>
        </button>

        <button
          onClick={() => navigate('/studio/messages')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#CE4F56] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 bg-[#CE4F56]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE4F56]/20 transition-colors">
            <MessageCircle size={18} className="text-[#CE4F56]" />
          </div>
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">Messages</p>
          <p className="text-[#9A9A94] text-xs">3 unread conversations</p>
          <div className="flex items-center gap-1 mt-3 text-[#CE4F56] text-xs font-semibold">
            View inbox <ArrowRight size={12} />
          </div>
        </button>

        <button
          onClick={() => navigate('/studio/profile')}
          className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:border-[#E89560] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 bg-[#E89560]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#E89560]/20 transition-colors">
            <Building2 size={18} className="text-[#E89560]" />
          </div>
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">Studio Profile</p>
          <p className="text-[#9A9A94] text-xs">Update your studio details</p>
          <div className="flex items-center gap-1 mt-3 text-[#E89560] text-xs font-semibold">
            Edit profile <ArrowRight size={12} />
          </div>
        </button>
      </div>

      {/* Recently active instructors */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Recently Active Instructors</h3>
            <p className="text-xs text-[#9A9A94] mt-0.5">Instructors actively seeking opportunities</p>
          </div>
          <button
            onClick={() => navigate('/studio/search')}
            className="text-xs text-[#2DA4D6] font-semibold hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {status === 'loading' && instructors.length === 0 ? (
          <div className="p-6">
            <CardSkeleton count={3} />
          </div>
        ) : (
          <div className="divide-y divide-[#E5E0D8]">
            {recentInstructors.map(inst => {
              const initials = inst.initials || inst.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={inst.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#FDFCF8] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3E3D38] text-sm font-semibold truncate">{inst.name}</p>
                    <p className="text-[#9A9A94] text-xs">{(inst.disciplines || []).join(', ')}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-xs text-[#9A9A94]">
                    <MapPin size={11} />
                    {inst.location}
                  </div>
                  <div className="hidden lg:block">
                    <span className="px-2.5 py-1 bg-[#6BE6A4]/20 text-[#3E3D38] text-[10px] font-semibold rounded-full">
                      {inst.availability}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/studio/messages')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-[#2DA4D6] text-white text-xs font-semibold rounded-lg hover:bg-[#2590bd]"
                  >
                    Message
                  </button>
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
          <p className="text-[#6B6B66] text-xs mt-0.5">First 3 months for $2 — founding member pricing locked in</p>
        </div>
        <button
          onClick={() => navigate('/studio/subscription')}
          className="text-xs text-[#3E3D38] font-bold hover:underline flex-shrink-0"
        >
          View plan
        </button>
      </div>
    </div>
  );
}
