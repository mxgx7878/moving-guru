import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DUMMY_USER } from '../data/dummyData';
import {
  Eye, MessageCircle, Heart, TrendingUp, Globe,
  MapPin, Calendar, Star, ArrowUpRight, Zap
} from 'lucide-react';

// Simple bar chart component
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.views));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const height = Math.round((d.views / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-semibold transition-all ${isLast ? 'text-black' : 'text-black/30'}`}>
              {d.views}
            </span>
            <div className="w-full relative group">
              <div
                className={`w-full rounded-t-md transition-all duration-500 cursor-default
                  ${isLast ? 'bg-[#d4f53c]' : 'bg-black/10 group-hover:bg-black/20'}`}
                style={{ height: `${Math.max(height * 0.8, 6)}px` }}
              />
            </div>
            <span className="text-[9px] text-black/40 tracking-wider">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'black', trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center`}
          style={{ background: color === 'lime' ? '#d4f53c' : color === 'orange' ? '#e8834a20' : '#f0f0ec' }}>
          <Icon size={16} className={color === 'lime' ? 'text-black' : color === 'orange' ? 'text-[#e8834a]' : 'text-black/50'} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={9} /> +{trend}%
          </span>
        )}
      </div>
      <p className="font-['Unbounded'] text-2xl font-black text-black mb-1">{value}</p>
      <p className="text-xs font-semibold text-black/60">{label}</p>
      {sub && <p className="text-[10px] text-black/30 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const profileData = user || DUMMY_USER;

  const totalViews = profileData.profileViews?.reduce((s, d) => s + d.views, 0) || 0;
  const thisMonth = profileData.profileViews?.[profileData.profileViews.length - 1]?.views || 0;
  const lastMonth = profileData.profileViews?.[profileData.profileViews.length - 2]?.views || 0;
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, #d4f53c 0%, transparent 60%)`
          }}
        />
        <div className="relative z-10">
          <p className="text-[#d4f53c] text-xs font-semibold tracking-widest uppercase mb-2">Welcome back</p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-white mb-1">
            {profileData.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/40 text-sm">
            {profileData.profileStatus === 'active'
              ? 'Your profile is live and attracting studios'
              : 'Your profile is currently inactive'}
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex flex-col items-end gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
            ${profileData.profileStatus === 'active'
              ? 'bg-[#d4f53c]/20 text-[#d4f53c]'
              : 'bg-white/10 text-white/40'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${profileData.profileStatus === 'active' ? 'bg-[#d4f53c]' : 'bg-white/30'}`} />
            {profileData.profileStatus === 'active' ? 'Actively Seeking' : 'Not Seeking'}
          </div>
          <p className="text-white/20 text-xs">
            {profileData.subscription?.charAt(0).toUpperCase() + profileData.subscription?.slice(1)} Plan
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Profile Views" value={thisMonth} sub="This month" color="lime" trend={growth > 0 ? growth : null} />
        <StatCard icon={TrendingUp} label="Total Views" value={totalViews} sub="All time" color="default" />
        <StatCard icon={MessageCircle} label="Messages" value="3" sub="Unread" color="orange" />
        <StatCard icon={Heart} label="Favourited" value="12" sub="Times saved" color="default" />
      </div>

      {/* Chart + Quick info */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-['Unbounded'] text-sm font-bold text-black">Profile Views</h3>
              <p className="text-xs text-black/40 mt-0.5">Monthly breakdown</p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/5 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4f53c]" />
              <span className="text-xs text-black/50">Views</span>
            </div>
          </div>
          <BarChart data={profileData.profileViews || []} />
        </div>

        {/* Quick info */}
        <div className="bg-white rounded-2xl p-5 border border-black/6 space-y-4">
          <h3 className="font-['Unbounded'] text-sm font-bold text-black">Profile Snapshot</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-black/30 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-black/30 uppercase tracking-wider">Location</p>
                <p className="text-xs font-medium text-black/80">{profileData.location || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe size={14} className="text-black/30 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-black/30 uppercase tracking-wider">Traveling To</p>
                <p className="text-xs font-medium text-black/80">{profileData.travelingTo || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-black/30 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-black/30 uppercase tracking-wider">Availability</p>
                <p className="text-xs font-medium text-black/80">{profileData.availability || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star size={14} className="text-black/30 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-black/30 uppercase tracking-wider">Disciplines</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(profileData.disciplines || []).slice(0, 3).map(d => (
                    <span key={d} className="text-[10px] bg-black/5 text-black/60 px-2 py-0.5 rounded-full">{d}</span>
                  ))}
                  {(profileData.disciplines || []).length > 3 && (
                    <span className="text-[10px] bg-black/5 text-black/40 px-2 py-0.5 rounded-full">
                      +{profileData.disciplines.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boost banner */}
      <div className="bg-[#e8834a] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-['Unbounded'] text-sm font-bold text-white">Boost your profile</p>
            <p className="text-white/60 text-xs mt-0.5">Get featured at the top of search results for $10/week</p>
          </div>
        </div>
        <button className="bg-white text-[#e8834a] font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap flex items-center gap-1.5">
          Boost <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
