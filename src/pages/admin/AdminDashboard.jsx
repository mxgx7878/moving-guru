import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Building2,
  Sprout,
  Briefcase,
  FileText,
  CreditCard,
  Clock,
  TrendingUp,
  DollarSign,
  TrendingDown,
} from "lucide-react";

import axiosInstance from "../../config/axiosInstance";
import { API_ENDPOINTS } from "../../constants/apiConstants";
import { DashboardSkeleton } from "../../components/feedback";
import { formatRelative } from "../../utils/formatters";
import {
  PageHeader,
  DashboardStatCard,
  Avatar,
  Chip,
  TabBar,
} from "../../components/ui";
import { RevenueChart,  RevenueTrendChart, RevenueCumulativeChart, ActivityCard, UserGrowthChart } from "../../features/dashboard";
import { Link } from "react-router-dom";

// Dashboard is a read-only aggregator. Local state keeps it thin — no
// shared store needed for data that appears on a single page.
export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const adminName = user?.name?.split(" ")[0] || "Admin";

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [revenue, setRevenue] = useState(null); // ← new
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState('bars');

  const REVENUE_TABS = [
  { id: 'bars',       label: 'Monthly Bars' },
  { id: 'trend',      label: 'Trend' },
  { id: 'cumulative', label: 'Lifetime' },
];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS),
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_ACTIVITY),
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_REVENUE), // ← new
    ]).then(([statsRes, activityRes, revenueRes]) => {
      if (cancelled) return;
      if (statsRes.status === "fulfilled")
        setStats(statsRes.value?.data?.data || null);
      if (activityRes.status === "fulfilled")
        setActivity(activityRes.value?.data?.data || null);
      if (revenueRes.status === "fulfilled")
        setRevenue(revenueRes.value?.data?.data || null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = [
    {
      label: "Instructors",
      value: stats?.instructors?.total,
      delta: stats?.instructors?.growth,
      sub: `${stats?.instructors?.new_this_month ?? 0} this month`,
      icon: Users,
      color: "#CE4F56",
      to: "/admin/users?role=instructor",
    },
    {
      label: "Studios",
      value: stats?.studios?.total,
      delta: stats?.studios?.growth,
      sub: `${stats?.studios?.new_this_month ?? 0} this month`,
      icon: Building2,
      color: "#2DA4D6",
      to: "/admin/users?role=studio",
    },
    {
      label: "Total Revenue",
      value:
        revenue?.total_revenue !== undefined
          ? `$${Number(revenue.total_revenue).toLocaleString()}`
          : null,
      delta: revenue?.growth,
      sub: revenue?.mock
        ? "Demo data — Stripe not connected"
        : `$${Number(revenue?.this_month ?? 0).toLocaleString()} this month`,
      icon: DollarSign,
      color: "#10B981",
      to: "/admin/dashboard",
    },
    {
      label: "Grow Posts",
      value: stats?.grow_posts?.total,
      sub: `${stats?.grow_posts?.pending ?? 0} pending review`,
      icon: Sprout,
      color: "#7F77DD",
      to: "/admin/grow",
    },
    {
      label: "Job Listings",
      value: stats?.jobs?.total,
      sub: `${stats?.jobs?.active ?? 0} active`,
      icon: Briefcase,
      color: "#E89560",
      to: "/admin/jobs",
    },
    {
      label: "Active Subscriptions",
      value: stats?.subscriptions?.active,
      sub: `${stats?.subscriptions?.trialing ?? 0} on trial`,
      icon: CreditCard,
      color: "#10B981",
      to: "/admin/subscriptions",
    },
    {
      label: "Platform Posts",
      value: stats?.platform_posts?.published,
      sub: `${stats?.platform_posts?.draft ?? 0} drafts`,
      icon: FileText,
      color: "#F59E0B",
      to: "/admin/posts",
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
        <p className="font-unbounded text-2xl font-black text-[#3E3D38]">
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

    {/* ── Summary strip — 3 columns of grouped metrics ───────── */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* Users */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase">Users</p>
          <Users size={14} className="text-[#7F77DD]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/users?role=instructor" className="hover:opacity-70 transition-opacity">
            <p className="text-[10px] text-[#9A9A94] font-semibold">Instructors</p>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38] mt-0.5">
              {stats?.instructors?.total ?? '—'}
            </p>
            <p className="text-[10px] text-[#10B981] mt-0.5 flex items-center gap-1">
              <TrendingUp size={9} />+{stats?.instructors?.new_this_month ?? 0} this month
            </p>
          </Link>
          <Link to="/admin/users?role=studio" className="hover:opacity-70 transition-opacity">
            <p className="text-[10px] text-[#9A9A94] font-semibold">Studios</p>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38] mt-0.5">
              {stats?.studios?.total ?? '—'}
            </p>
            <p className="text-[10px] text-[#10B981] mt-0.5 flex items-center gap-1">
              <TrendingUp size={9} />+{stats?.studios?.new_this_month ?? 0} this month
            </p>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase">Content</p>
          <Sprout size={14} className="text-[#7F77DD]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/admin/grow" className="hover:opacity-70 transition-opacity">
            <p className="text-[10px] text-[#9A9A94] font-semibold">Grow</p>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38] mt-0.5">
              {stats?.grow_posts?.total ?? '—'}
            </p>
            <p className="text-[10px] text-[#F59E0B] mt-0.5">{stats?.grow_posts?.pending ?? 0} pending</p>
          </Link>
          <Link to="/admin/jobs" className="hover:opacity-70 transition-opacity">
            <p className="text-[10px] text-[#9A9A94] font-semibold">Jobs</p>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38] mt-0.5">
              {stats?.jobs?.total ?? '—'}
            </p>
            <p className="text-[10px] text-[#10B981] mt-0.5">{stats?.jobs?.active ?? 0} active</p>
          </Link>
          <Link to="/admin/posts" className="hover:opacity-70 transition-opacity">
            <p className="text-[10px] text-[#9A9A94] font-semibold">Posts</p>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38] mt-0.5">
              {stats?.platform_posts?.published ?? '—'}
            </p>
            <p className="text-[10px] text-[#9A9A94] mt-0.5">{stats?.platform_posts?.draft ?? 0} drafts</p>
          </Link>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="bg-gradient-to-br from-[#10B981] to-[#0E9C73] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-white/80 tracking-widest uppercase">Revenue</p>
          <DollarSign size={14} className="text-white/80" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-white/80 font-semibold">Lifetime</p>
            <p className="font-unbounded text-2xl font-black mt-0.5">
              ${Number(revenue?.total_revenue ?? 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/80 font-semibold">MRR</p>
            <p className="font-unbounded text-2xl font-black mt-0.5">
              ${Number(revenue?.mrr ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-white mt-0.5 flex items-center gap-1">
              {(revenue?.growth ?? 0) >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(revenue?.growth ?? 0)}% MoM
            </p>
          </div>
        </div>
      </div>

    </div>

    {/* ── Revenue chart card (full width) ─────────────────────── */}
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
            <DollarSign size={16} className="text-[#10B981]" />
          </div>
          <div>
            <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Revenue</h3>
            <p className="text-[10px] text-[#9A9A94]">
              {revenueView === 'cumulative' ? 'Lifetime accumulated' : 'Last 12 months'}
            </p>
          </div>
        </div>

        <TabBar
          variant="pill"
          tabs={REVENUE_TABS}
          activeId={revenueView}
          onChange={setRevenueView}
        />
      </div>

      {revenueView === 'bars'       && <RevenueChart           data={revenue?.monthly_breakdown} loading={loading} />}
      {revenueView === 'trend'      && <RevenueTrendChart      data={revenue?.monthly_breakdown} loading={loading} />}
      {revenueView === 'cumulative' && <RevenueCumulativeChart data={revenue?.monthly_breakdown} loading={loading} />}

      {revenue?.mock && (
        <div className="mt-4 pt-3 border-t border-[#F0EBE3] text-[10px] text-[#9A9A94] text-center">
          Showing demo data — connect Stripe in subscription settings to see real revenue.
        </div>
      )}
    </div>

    {/* ── User growth chart (full width) ──────────────────────── */}
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#7F77DD]/10 flex items-center justify-center">
          <TrendingUp size={16} className="text-[#7F77DD]" />
        </div>
        <div>
          <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">User Growth</h3>
          <p className="text-[10px] text-[#9A9A94]">New signups over the last 6 months</p>
        </div>
      </div>

      <UserGrowthChart data={stats?.signups_by_month} loading={loading} />
    </div>

    {/* ── Activity feeds (compact two-column) ─────────────────── */}
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
            <Avatar name={u.name} size="sm" tone={u.role === 'studio' ? 'blue' : 'coral'} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#3E3D38] text-xs truncate">{u.name}</p>
              <Chip size="xs" tone={u.role === 'studio' ? 'blue' : 'coral'}>{u.role}</Chip>
            </div>
            <span className="text-[10px] text-[#9A9A94] whitespace-nowrap">
              {formatRelative(u.created_at)}
            </span>
          </div>
        )}
      />
    </div>
  </div>
);
}
