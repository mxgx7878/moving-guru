import { useEffect, useMemo, useState } from 'react';
import {
  CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import {
  StatCard, PageHeader, Toolbar, DataTable, EmptyState,
} from '../../components/ui';
import { SubscriptionRow } from '../../features/subscriptions';

const STATUS_OPTIONS = [
  { id: 'all',       label: 'All statuses' },
  { id: 'active',    label: 'Active'       },
  { id: 'trialing',  label: 'Trialing'     },
  { id: 'past_due',  label: 'Past Due'     },
  { id: 'cancelled', label: 'Cancelled'    },
];

const SUB_COLUMNS = [
  { key: 'user',    label: 'User' },
  { key: 'plan',    label: 'Plan' },
  { key: 'status',  label: 'Status' },
  { key: 'renewal', label: 'Next renewal' },
  { key: 'price',   label: 'Price', align: 'right' },
];

export default function AdminSubscriptions() {
  const [subs, setSubs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [query, setQuery]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance.get(API_ENDPOINTS.ADMIN_SUBSCRIPTIONS)
      .then(({ data }) => {
        if (cancelled) return;
        setSubs(data?.data?.subscriptions || data?.data || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.message || 'Failed to load subscriptions.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const active    = subs.filter((s) => s.status === 'active').length;
    const trialing  = subs.filter((s) => s.status === 'trialing').length;
    const cancelled = subs.filter((s) => s.status === 'cancelled' || s.status === 'canceled').length;
    const mrr = subs
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + (s.plan?.price_monthly || s.plan_price || 0), 0);
    return { active, trialing, cancelled, mrr };
  }, [subs]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return subs.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchQ = !q ||
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.plan?.name?.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [subs, statusFilter, query]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <PageHeader
        icon={CreditCard}
        iconBg="#10B9811A"
        iconColor="#10B981"
        eyebrow="Admin / Subscriptions"
        eyebrowColor="#10B981"
        title="Subscription Overview"
        description="Plan distribution and subscriber activity across the platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Active"    value={stats.active}    color="default" />
        <StatCard icon={Clock}        label="Trialing"  value={stats.trialing}  color="orange" />
        <StatCard icon={AlertCircle}  label="Cancelled" value={stats.cancelled} color="coral" />
        <StatCard icon={DollarSign}   label="MRR"       value={`$${stats.mrr.toLocaleString()}`} sub="Monthly recurring" />
      </div>

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search by user, email or plan...',
        }}
        filters={[{
          id: 'status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: STATUS_OPTIONS,
        }]}
      />

      {error ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
          <p className="text-[#3E3D38] font-semibold">{error}</p>
        </div>
      ) : (
        <DataTable
          columns={SUB_COLUMNS}
          rows={filtered}
          loading={loading}
          emptyState={(
            <EmptyState
              icon={CreditCard}
              title="No subscriptions match"
              message="Try adjusting your filters."
            />
          )}
          renderRow={(sub) => <SubscriptionRow key={sub.id} sub={sub} />}
        />
      )}
    </div>
  );
}
