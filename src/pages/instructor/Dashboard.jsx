import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Eye, MessageCircle, Heart, TrendingUp, Star, ArrowRight,
} from 'lucide-react';

import { fetchInstructorDashboard } from '../../store/actions/dashboardAction';
import { STATUS } from '../../constants/apiConstants';
import {
  PageHeader, Avatar, Chip, Button,
} from '../../components/ui';
import {
  MonthlyViewsChart, ApplicationStatusChart,
} from '../../features/dashboard';
import { CardSkeleton } from '../../components/feedback';
import { formatRelative } from '../../utils/formatters';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { instructor: data, status } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchInstructorDashboard());
  }, [dispatch]);

  const loading = status === STATUS.LOADING && !data;
  const kpis = data?.kpis || {};
  const profileId = user?.id || user?.user_id;
  const seeking = (user?.profileStatus || user?.profile_status) === 'active';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Welcome header — keeps original gradient */}
      <PageHeader
        variant="gradient"
        gradientFrom="#FDFCF8"
        gradientTo="#f5fca6"
        gradientAccent="#CE4F56"
        eyebrow="Welcome back"
        eyebrowColor="#CE4F56"
        title={user?.name?.split(' ')[0] || 'Instructor'}
        description={seeking
          ? 'Your profile is live and attracting studios'
          : 'Your profile is currently inactive'}
        actions={(
          <div className="flex flex-col gap-2 items-end">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              ${seeking ? 'bg-[#6BE6A4]/20 text-[#3E3D38]' : 'bg-[#FBF8E4] text-[#9A9A94]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${seeking ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
              {seeking ? 'Actively Seeking' : 'Not Seeking'}
            </div>
            {profileId && (
              <Button variant="primary" size="sm" icon={Eye}
                onClick={() => navigate(`/portal/profile`)}>
                View Profile
              </Button>
            )}
          </div>
        )}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile icon={Eye}           label="Profile Views" value={kpis.profile_views_this_month ?? 0}
          sub={`${kpis.profile_views_total ?? 0} all time`} color="#CE4F56" loading={loading} />
        <KpiTile icon={MessageCircle} label="Active Apps"   value={kpis.applications_active ?? 0}
          sub={`${kpis.applications_total ?? 0} total`}     color="#E89560" loading={loading} />
        <KpiTile icon={Heart}         label="Favourited"    value={kpis.favourited_by_count ?? 0}
          sub="By studios"                                  color="#7F77DD" loading={loading} />
        <KpiTile icon={Star}          label="Rating"
          value={kpis.rating_avg ? `${kpis.rating_avg}★` : '—'}
          sub={`${kpis.rating_count ?? 0} reviews`}         color="#F59E0B" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E0D8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Profile Views</h3>
              <p className="text-[10px] text-[#9A9A94]">Last 6 months</p>
            </div>
            <Chip size="xs" tone="coral">{kpis.profile_views_total ?? 0} total</Chip>
          </div>
          <MonthlyViewsChart data={data?.profile_views_by_month} loading={loading} accent="#CE4F56" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
          <div className="mb-2">
            <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Application Status</h3>
            <p className="text-[10px] text-[#9A9A94]">Across all your applications</p>
          </div>
          <ApplicationStatusChart data={data?.application_status} loading={loading} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ActivityList
          title="Recent Applications"
          items={data?.recent_applications}
          loading={loading}
          empty="You haven't applied to anything yet"
          ctaTo="/portal/applications"
          renderItem={(a) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#3E3D38] truncate">{a.job_title}</p>
                <p className="text-[10px] text-[#9A9A94]">{a.studio || '—'}</p>
              </div>
              <Chip size="xs" tone={
                a.status === 'accepted' ? 'green' :
                a.status === 'rejected' ? 'red' :
                a.status === 'viewed'   ? 'purple' : 'amber'
              }>{a.status}</Chip>
            </div>
          )}
        />

        <ActivityList
          title="Recent Profile Visitors"
          items={data?.recent_viewers}
          loading={loading}
          empty="No recent profile views"
          renderItem={(v) => (
            <div className="flex items-center gap-3">
              <Avatar name={v.viewer_name} size="sm"
                tone={v.viewer_role === 'studio' ? 'blue' : 'coral'} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#3E3D38] truncate">{v.viewer_name || 'Someone'}</p>
                <p className="text-[10px] text-[#9A9A94] capitalize">{v.viewer_role || '—'}</p>
              </div>
              <span className="text-[10px] text-[#9A9A94] whitespace-nowrap">
                {formatRelative(v.created_at)}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}

// ── Inline tile primitives ────────────────────────────────────
// Kept inline (not subcomponents in their own files) because they're
// used only on this page and have no reusability beyond it.
function KpiTile({ icon: Icon, label, value, sub, color, loading }) {
  if (loading) return <CardSkeleton count={1} height={120} />;
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-unbounded text-2xl font-black text-[#3E3D38]">{value}</p>
      <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold mt-1">{label}</p>
      <p className="text-[10px] text-[#9A9A94] mt-0.5">{sub}</p>
    </div>
  );
}

function ActivityList({ title, items, loading, empty, ctaTo, renderItem }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">{title}</h3>
        {ctaTo && (
          <Button variant="ghost" size="xs" iconRight={ArrowRight}
            onClick={() => navigate(ctaTo)}
            className="!text-coral hover:!underline">
            View all
          </Button>
        )}
      </div>
      {loading ? (
        <CardSkeleton count={3} />
      ) : !items?.length ? (
        <p className="text-xs text-[#9A9A94] py-6 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => <div key={it.id}>{renderItem(it)}</div>)}
        </div>
      )}
    </div>
  );
}