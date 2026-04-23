import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Users, Building2, Sprout, Briefcase, FileText, CreditCard,
  Clock, TrendingUp,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { DashboardSkeleton } from '../../components/feedback';
import { formatRelative } from '../../utils/formatters';
import {
  PageHeader, DashboardStatCard, Avatar, Chip,
} from '../../components/ui';
import { ActivityCard } from '../../features/dashboard';

// Dashboard is a read-only aggregator. Local state keeps it thin — no
// shared store needed for data that appears on a single page.
export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const adminName = user?.name?.split(' ')[0] || 'Admin';

  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS),
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_ACTIVITY),
    ]).then(([statsRes, activityRes]) => {
      if (cancelled) return;
      if (statsRes.status === 'fulfilled')
        setStats(statsRes.value?.data?.data || null);
      if (activityRes.status === 'fulfilled')
        setActivity(activityRes.value?.data?.data || null);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const tiles = [
    {
      label: 'Instructors',
      value: stats?.instructors?.total,
      delta: stats?.instructors?.growth,
      sub:   `${stats?.instructors?.new_this_month ?? 0} this month`,
      icon:  Users,
      color: '#CE4F56',
      to:    '/admin/users?role=instructor',
    },
    {
      label: 'Studios',
      value: stats?.studios?.total,
      delta: stats?.studios?.growth,
      sub:   `${stats?.studios?.new_this_month ?? 0} this month`,
      icon:  Building2,
      color: '#2DA4D6',
      to:    '/admin/users?role=studio',
    },
    {
      label: 'Grow Posts',
      value: stats?.grow_posts?.total,
      sub:   `${stats?.grow_posts?.pending ?? 0} pending review`,
      icon:  Sprout,
      color: '#7F77DD',
      to:    '/admin/grow',
    },
    {
      label: 'Job Listings',
      value: stats?.jobs?.total,
      sub:   `${stats?.jobs?.active ?? 0} active`,
      icon:  Briefcase,
      color: '#E89560',
      to:    '/admin/jobs',
    },
    {
      label: 'Active Subscriptions',
      value: stats?.subscriptions?.active,
      sub:   `${stats?.subscriptions?.trialing ?? 0} on trial`,
      icon:  CreditCard,
      color: '#10B981',
      to:    '/admin/subscriptions',
    },
    {
      label: 'Platform Posts',
      value: stats?.platform_posts?.published,
      sub:   `${stats?.platform_posts?.draft ?? 0} drafts`,
      icon:  FileText,
      color: '#F59E0B',
      to:    '/admin/posts',
    },
  ];

  if (loading && !stats && !activity) {
    return <DashboardSkeleton />;
  }

  const signupsAction = stats?.signups_today !== undefined && (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold">
          Signups today
        </p>
        <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">
          {stats.signups_today}
        </p>
      </div>
      <div className="w-12 h-12 bg-[#7F77DD]/10 rounded-2xl flex items-center justify-center">
        <TrendingUp size={22} className="text-[#7F77DD]" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <PageHeader
        eyebrow="Admin Dashboard"
        eyebrowColor="#7F77DD"
        title={`Welcome back, ${adminName}`}
        description="Platform health, recent activity and quick moderation actions."
        actions={signupsAction}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => <DashboardStatCard key={t.label} {...t} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard
          title="Pending Moderation"
          subtitle="Grow posts awaiting your review"
          icon={Clock}
          accent="#F59E0B"
          to="/admin/grow"
          loading={loading}
          items={activity?.pending_grow_posts}
          empty="Nothing pending — caught up!"
          renderItem={(p) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#3E3D38] text-xs truncate">{p.title}</p>
                <p className="text-[10px] text-[#9A9A94]">
                  {p.type?.toUpperCase()} · {p.posted_by || p.user?.name || '—'}
                </p>
              </div>
              <span className="text-[10px] text-[#9A9A94] whitespace-nowrap">
                {formatRelative(p.created_at)}
              </span>
            </div>
          )}
        />

        <ActivityCard
          title="Recent Signups"
          subtitle="New instructors and studios"
          icon={Users}
          accent="#7F77DD"
          to="/admin/users"
          loading={loading}
          items={activity?.recent_signups}
          empty="No new signups."
          renderItem={(u) => (
            <div className="flex items-center gap-3">
              <Avatar
                name={u.name}
                src={u?.detail?.profile_picture_url || u?.detail?.profile_picture || u?.profile_picture_url || u?.profile_picture}
                tone={u.role === 'studio' ? 'blue' : 'coral'}
                size="xs"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#3E3D38] text-xs truncate">{u.name}</p>
                <p className="text-[10px] text-[#9A9A94] capitalize">
                  {u.role} · {u.email}
                </p>
              </div>
              <span className="text-[10px] text-[#9A9A94] whitespace-nowrap">
                {formatRelative(u.created_at)}
              </span>
            </div>
          )}
        />

        <ActivityCard
          title="Latest Job Listings"
          subtitle="Postings created by studios"
          icon={Briefcase}
          accent="#E89560"
          to="/admin/jobs"
          loading={loading}
          items={activity?.recent_jobs}
          empty="No jobs posted yet."
          renderItem={(j) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#3E3D38] text-xs truncate">{j.title}</p>
                <p className="text-[10px] text-[#9A9A94]">
                  {j.studio_name || j.studio?.name || '—'} · {j.location || '—'}
                </p>
              </div>
              <Chip size="xs" tone={j.is_active ? 'emerald' : 'neutral'}>
                {j.is_active ? 'ACTIVE' : 'CLOSED'}
              </Chip>
            </div>
          )}
        />

        <ActivityCard
          title="Subscription Activity"
          subtitle="Recent plan changes"
          icon={CreditCard}
          accent="#10B981"
          to="/admin/subscriptions"
          loading={loading}
          items={activity?.recent_subscriptions}
          empty="No subscription activity."
          renderItem={(s) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#3E3D38] text-xs truncate">
                  {s.user?.name || s.user_name || '—'}
                </p>
                <p className="text-[10px] text-[#9A9A94]">
                  {s.plan_name || s.plan?.name || '—'} · {s.status}
                </p>
              </div>
              <span className="text-[10px] text-[#9A9A94] whitespace-nowrap">
                {formatRelative(s.created_at)}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
