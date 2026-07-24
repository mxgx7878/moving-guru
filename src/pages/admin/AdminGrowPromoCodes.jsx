import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Ticket, Plus, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';

import {
  fetchGrowPromoCodes, createGrowPromoCode, toggleGrowPromoCode, deleteGrowPromoCode,
} from '../../store/actions/growPromoAction';
import { clearGrowPromoError, clearGrowPromoMessage } from '../../store/slices/growPromoSlice';
import { STATUS } from '../../constants/apiConstants';
import {
  Button, PageHeader, Toolbar, DataTable, EmptyState, IconButton, StatCard,
} from '../../components/ui';
import { ConfirmModal } from '../../features/modals';
import GrowPromoCodeForm from '../../features/forms/GrowPromoCodeForm';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All codes' },
  { id: 'active',   label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const COLUMNS = [
  { key: 'code',     label: 'Code' },
  { key: 'discount', label: 'Discount' },
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
  p.discount_type === 'percent'
    ? `${Number(p.discount_value)}% off`
    : `${p.currency || ''} ${Number(p.discount_value)} off`;

export default function AdminGrowPromoCodes() {
  const dispatch = useDispatch();
  const { promoCodes, status, mutating, message, error } = useSelector((s) => s.growPromo);

  const [statusFilter,   setStatusFilter]   = useState('all');
  const [query,          setQuery]          = useState('');
  const [formOpen,       setFormOpen]       = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null);

  useEffect(() => { dispatch(fetchGrowPromoCodes()); }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearGrowPromoMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Something went wrong');
      dispatch(clearGrowPromoError());
    }
  }, [error, dispatch]);

  const stats = useMemo(() => ({
    total:       promoCodes.length,
    active:      promoCodes.filter((p) => p.is_active).length,
    inactive:    promoCodes.filter((p) => !p.is_active).length,
    redemptions: promoCodes.reduce((sum, p) => sum + (p.times_redeemed ?? 0), 0),
  }), [promoCodes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promoCodes.filter((p) => {
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active'   &&  p.is_active)
        || (statusFilter === 'inactive' && !p.is_active);
      const matchQ = !q || p.code?.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [promoCodes, statusFilter, query]);

  const handleCreate = async (payload) => {
    const result = await dispatch(createGrowPromoCode(payload));
    if (createGrowPromoCode.fulfilled.match(result)) setFormOpen(false);
  };

  const handleToggle = (p) => {
    if (mutating) return;
    dispatch(toggleGrowPromoCode({ id: p.id, isActive: !p.is_active }));
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    setDeletingTarget(null);
    await dispatch(deleteGrowPromoCode(target.id));
  };

  const isLoading = status === STATUS.LOADING && promoCodes.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={Ticket}
        iconBg="#4E7A1B1A"
        iconColor="#4E7A1B"
        eyebrow="Admin / Grow Promo Codes"
        eyebrowColor="#4E7A1B"
        title="Grow Promo Codes"
        description="Discount codes for Grow listing fees. Separate from subscription promo codes. Limited by a total usage cap and expiry only — no per-person limit."
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
          const used  = p.times_redeemed ?? 0;
          const limit = p.max_redemptions ? `/ ${p.max_redemptions}` : '';
          return (
            <tr key={p.id} className="hover:bg-[#FFFFFF] transition-colors">
              <td className="px-4 py-3">
                <span className="text-sm font-bold font-mono text-[#3E3D38]">{p.code}</span>
              </td>
              <td className="px-4 py-3 text-sm text-[#3E3D38]">{discountLabel(p)}</td>
              <td className="px-4 py-3 text-right text-sm text-[#3E3D38]">{used} {limit}</td>
              <td className="px-4 py-3 text-sm text-[#9A9A94]">{fmtDate(p.expires_at)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggle(p)}
                  disabled={mutating}
                  title={p.is_active ? 'Click to deactivate' : 'Click to activate'}
                  className={`text-xs font-semibold px-2 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                    p.is_active
                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-[#9A9A94] bg-[#F5F2EC] hover:bg-[#E5E0D8]'
                  }`}
                >
                  {p.is_active ? '● Active' : '○ Inactive'}
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
        <GrowPromoCodeForm
          saving={mutating}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {deletingTarget && (
        <ConfirmModal
          title={(deletingTarget.times_redeemed || 0) > 0 ? 'Archive code?' : 'Delete code?'}
          message={
            (deletingTarget.times_redeemed || 0) > 0
              ? `"${deletingTarget.code}" has been redeemed and will be archived (deactivated) instead of deleted.`
              : `Permanently delete "${deletingTarget.code}"?`
          }
          confirmLabel={(deletingTarget.times_redeemed || 0) > 0 ? 'Archive' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTarget(null)}
        />
      )}
    </div>
  );
}
