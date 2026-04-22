import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Users,
  Building2,
  Sprout,
  Briefcase,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";

import axiosInstance from "../../config/axiosInstance";
import { API_ENDPOINTS } from "../../constants/apiConstants";
import { DashboardSkeleton } from "../../components/feedback";

// Dashboard is a read-only aggregator. Local state keeps it thin — no
// shared store needed for data that appears on a single page.
export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const adminName = user?.name?.split(" ")[0] || "Admin";

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS),
      axiosInstance.get(API_ENDPOINTS.ADMIN_DASHBOARD_ACTIVITY),
    ]).then(([statsRes, activityRes]) => {
      if (cancelled) return;
      if (statsRes.status === "fulfilled")
        setStats(statsRes.value?.data?.data || null);
      if (activityRes.status === "fulfilled")
        setActivity(activityRes.value?.data?.data || null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Stat tiles configuration ──────────────────────────────────
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-1">
            Admin Dashboard
          </p>
          <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38]">
            Welcome back, {adminName}
          </h1>
          <p className="text-[#6B6B66] text-sm mt-1">
            Platform health, recent activity and quick moderation actions.
          </p>
        </div>
        {stats?.signups_today !== undefined && (
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
        )}
      </div>

      {/* ── Stat tiles ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
      </div>

      {/* ── Activity grid ──────────────────────────────────────── */}
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
                <p className="font-semibold text-[#3E3D38] text-xs truncate">
                  {p.title}
                </p>
                <p className="text-[10px] text-[#9A9A94]">
                  {p.type?.toUpperCase()} · {p.posted_by || p.user?.name || "—"}
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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0
                ${u.role === "studio" ? "bg-[#2DA4D6]" : "bg-[#CE4F56]"}`}
              >
                {(u.name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#3E3D38] text-xs truncate">
                  {u.name}
                </p>
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
                <p className="font-semibold text-[#3E3D38] text-xs truncate">
                  {j.title}
                </p>
                <p className="text-[10px] text-[#9A9A94]">
                  {j.studio_name || j.studio?.name || "—"} · {j.location || "—"}
                </p>
              </div>
              {j.is_active ? (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  ACTIVE
                </span>
              ) : (
                <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  CLOSED
                </span>
              )}
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
                  {s.user?.name || s.user_name || "—"}
                </p>
                <p className="text-[10px] text-[#9A9A94]">
                  {s.plan_name || s.plan?.name || "—"} · {s.status}
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

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function StatTile({ label, value, sub, delta, icon: Icon, color, to }) {
  const display = value ?? "—";
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-[#E5E0D8] p-5 hover:shadow-md transition-all hover:border-[#3E3D38]/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + "15" }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {typeof delta === "number" && delta !== 0 && (
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
            ${delta > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}
          >
            <TrendingUp size={9} className={delta < 0 ? "rotate-180" : ""} />
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">
        {display}
      </p>
      <p className="text-xs font-semibold text-[#6B6B66]">{label}</p>
      {sub && <p className="text-[10px] text-[#9A9A94] mt-0.5">{sub}</p>}
      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#9A9A94] group-hover:text-[#3E3D38]">
        Open <ArrowRight size={10} />
      </span>
    </Link>
  );
}

function ActivityCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  to,
  items,
  loading,
  empty,
  renderItem,
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: accent + "15" }}
          >
            <Icon size={15} style={{ color: accent }} />
          </div>
          <div>
            <p className="font-['Unbounded'] text-xs font-bold text-[#3E3D38]">
              {title}
            </p>
            <p className="text-[10px] text-[#9A9A94]">{subtitle}</p>
          </div>
        </div>
        <Link
          to={to}
          className="text-[10px] font-semibold text-[#9A9A94] hover:text-[#3E3D38] flex items-center gap-1"
        >
          View all <ArrowRight size={10} />
        </Link>
      </div>
      <div className="divide-y divide-[#F0EBE3]">
        {loading && (!items || items.length === 0) ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#9A9A94]" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 size={20} className="mx-auto text-[#C4BCB4] mb-1.5" />
            <p className="text-[11px] text-[#9A9A94]">{empty}</p>
          </div>
        ) : (
          items.slice(0, 5).map((item, i) => (
            <div key={item.id || i} className="px-5 py-3 hover:bg-[#FDFCF8]">
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Lightweight relative time helper — avoids pulling in dayjs/moment.
function formatRelative(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
