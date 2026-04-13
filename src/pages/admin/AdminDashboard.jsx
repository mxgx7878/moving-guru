import { useSelector } from 'react-redux';
import {
  Users, Building2, Briefcase, Sprout, Star, MessageCircle,
  TrendingUp, ArrowUpRight, AlertTriangle
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   Admin dashboard placeholder.
   The client noted the admin side wasn't showing anything yet,
   so this provides a basic shell with stats + activity that
   matches the rest of the portal styling and palette.
   ──────────────────────────────────────────────────────────── */

const STAT_CARDS = [
  { id: 'instructors', icon: Users,         label: 'Instructors',     value: '1,243', sub: 'Active members',    color: '#CE4F56' },
  { id: 'studios',     icon: Building2,     label: 'Studios',         value: '218',   sub: 'Verified studios',  color: '#2DA4D6' },
  { id: 'jobs',        icon: Briefcase,     label: 'Open Listings',   value: '64',    sub: 'Across all studios', color: '#E89560' },
  { id: 'grow',        icon: Sprout,        label: 'Grow Posts',      value: '37',    sub: 'Trainings + retreats', color: '#6BE6A4' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'studio',     text: 'Imagine Studios Bali registered',            time: '2h ago' },
  { id: 2, type: 'instructor', text: 'Sarah Chen completed her instructor profile', time: '4h ago' },
  { id: 3, type: 'job',        text: 'New job listing — Pilates Cover, Sydney',     time: '6h ago' },
  { id: 4, type: 'grow',       text: 'Yoga Alliance RYT-500 retreat post added',    time: '1d ago' },
  { id: 5, type: 'subscription', text: 'Tiger Muay Thai Academy upgraded to Annual', time: '1d ago' },
];

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const adminName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#7F77DD]/10 rounded-2xl p-6 border border-[#E5E0D8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, #7F77DD 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-2">Admin Dashboard</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
            Welcome back, {adminName}
          </h1>
          <p className="text-[#6B6B66] text-sm">
            Platform health, recent activity, and quick links
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ id, icon: Icon, label, value, sub, color }) => (
          <div key={id}
            className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: color + '15' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">{value}</p>
            <p className="text-[#3E3D38] text-xs font-semibold mt-1">{label}</p>
            <p className="text-[#9A9A94] text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Activity + alerts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Recent Activity</h3>
            <button className="text-xs text-[#7F77DD] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </button>
          </div>
          <ul className="divide-y divide-[#E5E0D8]">
            {RECENT_ACTIVITY.map(item => (
              <li key={item.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-[#FBF8E4] transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#7F77DD] flex-shrink-0" />
                <p className="flex-1 text-sm text-[#3E3D38] truncate">{item.text}</p>
                <span className="text-[10px] text-[#9A9A94] flex-shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick stats / alerts */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#6BE6A4]/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-[#3E3D38]" />
              </div>
              <div>
                <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38]">Monthly Growth</h3>
                <p className="text-[10px] text-[#9A9A94]">vs. last month</p>
              </div>
            </div>
            <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">+12.4%</p>
            <p className="text-xs text-[#6B6B66] mt-1">New sign-ups across both portals</p>
          </div>

          <div className="bg-[#f5fca6]/40 rounded-2xl border border-[#f5fca6] p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-[#f5fca6] rounded-xl flex items-center justify-center">
                <AlertTriangle size={16} className="text-[#3E3D38]" />
              </div>
              <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38]">Pending Reviews</h3>
            </div>
            <p className="text-sm text-[#3E3D38] font-semibold">3 studios awaiting verification</p>
            <button className="mt-3 text-xs font-bold text-[#3E3D38] hover:underline">Review now →</button>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Users,         label: 'Manage Instructors', sub: 'View, suspend, or verify',     color: '#CE4F56' },
          { icon: Building2,     label: 'Manage Studios',     sub: 'Approve and curate listings',  color: '#2DA4D6' },
          { icon: Star,          label: 'Subscriptions',      sub: 'Plans, billing, promo codes',  color: '#E89560' },
          { icon: MessageCircle, label: 'Support Inbox',      sub: 'Member tickets & feedback',     color: '#7F77DD' },
          { icon: Briefcase,     label: 'Job Listings',       sub: 'Moderate active postings',     color: '#3E3D38' },
          { icon: Sprout,        label: 'Grow Posts',         sub: 'Curate retreats & trainings',  color: '#6BE6A4' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <button key={label}
            className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: color + '15' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38] mb-1">{label}</p>
            <p className="text-[#9A9A94] text-xs">{sub}</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color }}>
              Open <ArrowUpRight size={12} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
