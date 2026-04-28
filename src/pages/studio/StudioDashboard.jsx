import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, MessageCircle, Heart, Users, Building2,
  Briefcase, ArrowRight, TrendingUp,
} from 'lucide-react';

import { fetchStudioDashboard } from '../../store/actions/dashboardAction';
import { STATUS } from '../../constants/apiConstants';
import {
  PageHeader, Avatar, Chip, Button,
} from '../../components/ui';
import {
  ApplicationsReceivedChart, ApplicationStatusChart,
} from '../../features/dashboard';
import { CardSkeleton } from '../../components/feedback';
import { formatRelative } from '../../utils/formatters';

export default function StudioDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { studio: data, status } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchStudioDashboard());
  }, [dispatch]);

  const loading = status === STATUS.LOADING && !data;
  const kpis = data?.kpis || {};
  const studioName = user?.studio_name || user?.studioName || user?.name || 'Studio';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <PageHeader
        variant="gradient"
        gradientFrom="#FDFCF8"
        gradientTo="#2DA4D610"
        gradientAccent="#2DA4D6"
        eyebrow="Studio Dashboard"
        eyebrowColor="#2DA4D6"
        title={studioName}
        description="Find your next great instructor from the Moving Guru network"
        actions={(
          <Button variant="primary" size="lg" icon={Search}
            onClick={() => navigate('/studio/search')}>
            Find Instructors
          </Button>
        )}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile icon={Briefcase}     label="Active Listings" value={kpis.active_listings ?? 0}
          sub={`${kpis.total_listings ?? 0} total`}           color="#2DA4D6" loading={loading} />
        <KpiTile icon={MessageCircle} label="Applicants"      value={kpis.applicants_total ?? 0}
          sub={`${kpis.applicants_this_week ?? 0} this week`} color="#E89560" loading={loading} />
        <KpiTile icon={Heart}         label="Saved"           value={kpis.saved_instructors ?? 0}
          sub="Instructors in favourites"                     color="#7F77DD" loading={loading} />
        <KpiTile icon={Users}         label="Network"         value={kpis.instructors_on_platform ?? 0}
          sub="Active instructors"                            color="#10B981" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E0D8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Applications Received</h3>
              <p className="text-[10px] text-[#9A9A94]">Last 6 months</p>
            </div>
            <Chip size="xs" tone="blue">{kpis.applicants_total ?? 0} total</Chip>
          </div>
          <ApplicationsReceivedChart data={data?.applications_by_month} loading={loading} />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
          <div className="mb-2">
            <h3 className="font-unbounded text-sm font-bold text-[#3E3D38]">Listing Types</h3>
            <p className="text-[10px] text-[#9A9A94]">Across your jobs</p>
          </div>
          <ApplicationStatusChart data={data?.listing_types} loading={loading} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/studio/jobs',     icon: Briefcase, color: '#2DA4D6', title: 'Manage Listings',  desc: 'Post and edit your job openings' },
          { to: '/studio/search',   icon: Search,    color: '#CE4F56', title: 'Find Instructors',  desc: 'Browse our active community' },
          { to: '/studio/profile',  icon: Building2, color: '#E89560', title: 'Studio Profile',    desc: 'Update your studio details' },
        ].map((q) => (
          <button key={q.to} onClick={() => navigate(q.to)}
            className="bg-white rounded-2xl p-5 border border-[#E5E0D8] text-left transition-all
              hover:shadow-sm group" style={{ '--accent': q.color }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
              style={{ backgroundColor: `${q.color}15` }}>
              <q.icon size={18} style={{ color: q.color }} />
            </div>
            <p className="font-unbounded text-sm font-black text-[#3E3D38] mb-1">{q.title}</p>
            <p className="text-[#9A9A94] text-xs">{q.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: q.color }}>
              Open <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ActivityList
          title="Recent Applications"
          items={data?.recent_applications}
          loading={loading}
          empty="No applications yet"
          ctaTo="/studio/jobs"
          renderItem={(a) => (
            <div className="flex items-center gap-3">
              <Avatar name={a.instructor} size="sm" tone="coral" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#3E3D38] truncate">{a.instructor || '—'}</p>
                <p className="text-[10px] text-[#9A9A94] truncate">applied to {a.job_title}</p>
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
          title="Recently Active Instructors"
          items={data?.active_instructors}
          loading={loading}
          empty="No active instructors found"
          ctaTo="/studio/search"
          renderItem={(inst) => (
            <div className="flex items-center gap-3">
              <Avatar name={inst.name} size="sm" tone="coral" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#3E3D38] truncate">{inst.name}</p>
                <p className="text-[10px] text-[#9A9A94] capitalize">{inst.role}</p>
              </div>
              <Button variant="ghost" size="xs" iconRight={ArrowRight}
                onClick={() => navigate(`/studio/instructors/${inst.id}`)}
                className="!text-sky-mg hover:!underline">View</Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

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
            className="!text-sky-mg hover:!underline">
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