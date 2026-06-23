import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Ticket, Plus, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';

import {
  fetchPromoCodes, createPromoCode, togglePromoCode, deletePromoCode,
} from '../../store/actions/promoCodeAction';
import { clearPromoError, clearPromoMessage } from '../../store/slices/promoCodeSlice';
import { STATUS } from '../../constants/apiConstants';
import {
  Button, PageHeader, Toolbar, DataTable, EmptyState, IconButton, StatCard,
} from '../../components/ui';
import { ConfirmModal } from '../../features/modals';
import PromoCodeForm from '../../features/forms/PromoCodeForm';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All codes' },
  { id: 'active',   label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const COLUMNS = [
  { key: 'code',     label: 'Code' },
  { key: 'discount', label: 'Discount' },
  { key: 'duration', label: 'Duration' },
  { key: 'usage',    label: 'Usage', align: 'right' },
  { key: 'expires',  label: 'Expires' },
  { key: 'status',   label: 'Status' },
  { key: 'actions',  label: 'Actions', align: 'right' },
];

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const discountLabel = (p) =>
  p.discountType === 'percent' ? `${Number(p.discountValue)}% off` : `${p.currency || ''} ${Number(p.discountValue)} off`;

const durationLabel = (p) =>
  p.duration === 'repeating' ? `${p.durationInMonths} mo` : (p.duration === 'forever' ? 'Forever' : 'Once');

export default function AdminPromoCodes() {
  const dispatch = useDispatch();
  const { promoCodes, status, mutating, message, error } = useSelector((s) => s.promo);

  const [statusFilter,   setStatusFilter]   = useState('all');
  const [query,          setQuery]          = useState('');
  const [formOpen,       setFormOpen]       = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null);

  useEffect(() => { dispatch(fetchPromoCodes()); }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearPromoMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Something went wrong');
      dispatch(clearPromoError());
    }
  }, [error, dispatch]);

  const stats = useMemo(() => ({
    total:       promoCodes.length,
    active:      promoCodes.filter((p) => p.isActive).length,
    inactive:    promoCodes.filter((p) => !p.isActive).length,
    redemptions: promoCodes.reduce((sum, p) => sum + (p.redemptionsCount ?? p.timesRedeemed ?? 0), 0),
  }), [promoCodes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promoCodes.filter((p) => {
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active'   &&  p.isActive)
        || (statusFilter === 'inactive' && !p.isActive);
      const matchQ = !q || p.code?.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [promoCodes, statusFilter, query]);

  const handleCreate = async (payload) => {
    const result = await dispatch(createPromoCode(payload));
    if (createPromoCode.fulfilled.match(result)) setFormOpen(false);
  };

  const handleToggle = (p) => {
    if (mutating) return;
    dispatch(togglePromoCode({ id: p.id, isActive: !p.isActive }));
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    setDeletingTarget(null);
    await dispatch(deletePromoCode(target.id));
  };

  const isLoading = status === STATUS.LOADING && promoCodes.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={Ticket}
        iconBg="#4E7A1B1A"
        iconColor="#4E7A1B"
        eyebrow="Admin / Promo Codes"
        eyebrowColor="#4E7A1B"
        title="Promo Codes"
        description="Codes sync to Stripe as Coupons + Promotion Codes. Each customer can use a code only once."
        actions={(
          <Button variant="primary" icon={Plus} onClick={() => setFormOpen(true)}>New Code</Button>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket}       label="Total codes"  value={stats.total} />
        <StatCard icon={CheckCircle2} label="Active"       value={stats.active}   color="default" />
        <StatCard icon={XCircle}      label="Inactive"     value={stats.inactive} color="coral" />
        <StatCard icon={Users}        label="Redemptions"  value={stats.redemptions} sub="Total uses" />
      </div>

      <Toolbar
        search={{ value: query, onChange: setQuery, placeholder: 'Search by code...' }}
        filters={[{ id: 'status', value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS }]}
      />

      <DataTable
        columns={COLUMNS}
        rows={filtered}
        loading={isLoading}
        emptyState={<EmptyState icon={Ticket} title="No codes match" message="Try adjusting your filters or create a new code." />}
        renderRow={(p) => {
          const used  = p.redemptionsCount ?? p.timesRedeemed ?? 0;
          const limit = p.maxRedemptions ? `/ ${p.maxRedemptions}` : '';
          return (
            <tr key={p.id} className="hover:bg-[#FFFFFF] transition-colors">
              <td className="px-4 py-3">
                <span className="text-sm font-bold font-mono text-[#3E3D38]">{p.code}</span>
              </td>
              <td className="px-4 py-3 text-sm text-[#3E3D38]">{discountLabel(p)}</td>
              <td className="px-4 py-3 text-sm text-[#3E3D38]">{durationLabel(p)}</td>
              <td className="px-4 py-3 text-right text-sm text-[#3E3D38]">{used} {limit}</td>
              <td className="px-4 py-3 text-sm text-[#9A9A94]">{fmtDate(p.expiresAt)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(p)}
                  disabled={mutating}
                  title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                  className={`text-xs font-semibold px-2 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                    p.isActive
                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-[#9A9A94] bg-[#F5F2EC] hover:bg-[#E5E0D8]'
                  }`}
                >
                  {p.isActive ? '● Active' : '○ Inactive'}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <IconButton variant="plain" aria-label="Delete code" title="Delete code"
                    onClick={() => setDeletingTarget(p)} disabled={mutating}>
                    <Trash2 size={14} className="text-rose-500" />
                  </IconButton>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {formOpen && (
        <PromoCodeForm
          saving={mutating}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {deletingTarget && (
        <ConfirmModal
          title={(deletingTarget.redemptionsCount || 0) > 0 ? 'Archive code?' : 'Delete code?'}
          message={
            (deletingTarget.redemptionsCount || 0) > 0
              ? `"${deletingTarget.code}" has been redeemed and will be archived (deactivated in Stripe) instead of deleted.`
              : `Permanently delete "${deletingTarget.code}"? Its Stripe coupon will be removed.`
          }
          confirmLabel={(deletingTarget.redemptionsCount || 0) > 0 ? 'Archive' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTarget(null)}
        />
      )}
    </div>
  );
}