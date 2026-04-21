import { useEffect, useMemo, useState } from 'react';
import {
  CreditCard, Search, X, Loader2, TrendingUp, DollarSign,
  Calendar, Users, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';

import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { StatCard } from '../../components/ui';

// Admin subscriptions overview. Surfaces plan distribution, MRR,
// churn, and a filterable subscriber list. Read-only page — subscription
// changes happen in Stripe / the billing provider, not from inside the app.
export default function AdminSubscriptions() {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [query, setQuery]     = useState('');
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
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
            <CreditCard size={22} className="text-[#10B981]" />
          </div>
          <div>
            <p className="text-[#10B981] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; Subscriptions
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Subscription Overview
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Plan distribution and subscriber activity across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="green" />
        <StatCard icon={Clock}        label="Trialing" value={stats.trialing} color="orange" />
        <StatCard icon={AlertCircle}  label="Cancelled" value={stats.cancelled} color="coral" />
        <StatCard icon={DollarSign}   label="MRR" value={`$${stats.mrr.toLocaleString()}`} sub="Monthly recurring" color="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by user, email or plan..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-sm text-[#3E3D38]">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-center py-16">
          <Loader2 size={26} className="animate-spin text-[#10B981]" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
          <p className="text-[#3E3D38] font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] py-16 text-center">
          <CreditCard size={36} className="mx-auto text-[#C4BCB4] mb-3" />
          <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">No subscriptions match</p>
          <p className="text-[#9A9A94] text-xs mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FDFCF8] text-left">
              <tr className="text-[10px] text-[#9A9A94] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Plan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Next renewal</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => <SubRow key={s.id} sub={s} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubRow({ sub }) {
  const user = sub.user || {};
  const plan = sub.plan || {};
  const statusCls = {
    active:    'bg-green-50 text-green-700',
    trialing:  'bg-yellow-50 text-yellow-700',
    past_due:  'bg-orange-50 text-orange-700',
    cancelled: 'bg-red-50 text-red-700',
    canceled:  'bg-red-50 text-red-700',
  }[sub.status] || 'bg-gray-50 text-gray-600';

  const price = plan.price_monthly || sub.plan_price || 0;

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4">
        <p className="font-semibold text-[#3E3D38] text-xs">{user.name || user.studio_name || '—'}</p>
        <p className="text-[10px] text-[#9A9A94]">{user.email || '—'}</p>
      </td>
      <td className="py-3 px-4 text-xs text-[#3E3D38]">{plan.name || sub.plan_name || '—'}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls} capitalize`}>
          {sub.status?.replace('_', ' ') || '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-[#6B6B66]">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {sub.current_period_end
            ? new Date(sub.current_period_end).toLocaleDateString()
            : '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-right text-xs font-semibold text-[#3E3D38]">
        {price ? `$${price}` : '—'}
      </td>
    </tr>
  );
}
