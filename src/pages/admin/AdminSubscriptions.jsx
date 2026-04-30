// src/pages/admin/AdminSubscriptions.jsx
//
// CHANGES:
// - Status pill is now CLICKABLE — one click toggles Active ↔ Archived
// - Sliders icon → opens PlanFeaturesModal
// - "Sync from Stripe" button in header

import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Star, Plus, Edit2, Trash2, CheckCircle2, XCircle, Users, RefreshCw, Sliders,
} from 'lucide-react';

import {
  fetchAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  syncAdminPlansFromStripe,
} from '../../store/actions/subscriptionAction';
import {
  clearSubscriptionError,
  clearSubscriptionMessage,
} from '../../store/slices/subscriptionSlice';
import { STATUS } from '../../constants/apiConstants';
import {
  Button, PageHeader, Toolbar, DataTable, EmptyState, IconButton, StatCard,
} from '../../components/ui';
import { ConfirmModal } from '../../features/modals';
import { PlanForm } from '../../features/forms';
import PlanFeaturesModal from '../../features/billing/PlanFeatureModal';

const STATUS_OPTIONS = [
  { id: 'all',      label: 'All plans' },
  { id: 'active',   label: 'Active' },
  { id: 'inactive', label: 'Archived' },
];

const PLAN_COLUMNS = [
  { key: 'name',        label: 'Plan' },
  { key: 'price',       label: 'Price' },
  { key: 'billing',     label: 'Billing' },
  { key: 'subscribers', label: 'Subscribers', align: 'right' },
  { key: 'status',      label: 'Status' },
  { key: 'actions',     label: 'Actions', align: 'right' },
];

export default function AdminSubscriptions() {
  const dispatch = useDispatch();
  const {
    adminPlans,
    adminPlansStatus,
    adminPlanMutating,
    adminSyncing,
    message,
    error,
  } = useSelector((s) => s.subscription);

  const [statusFilter,    setStatusFilter]    = useState('all');
  const [query,           setQuery]           = useState('');
  const [formOpen,        setFormOpen]        = useState(false);
  const [editing,         setEditing]         = useState(null);
  const [deletingTarget,  setDeletingTarget]  = useState(null);
  const [featuresTarget,  setFeaturesTarget]  = useState(null);

  useEffect(() => { dispatch(fetchAdminPlans()); }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearSubscriptionMessage()); }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Something went wrong');
      dispatch(clearSubscriptionError());
    }
  }, [error, dispatch]);

  const stats = useMemo(() => ({
    total:       adminPlans.length,
    active:      adminPlans.filter((p) => p.isActive).length,
    archived:    adminPlans.filter((p) => !p.isActive).length,
    subscribers: adminPlans.reduce((sum, p) => sum + (p.subscribersCount || 0), 0),
  }), [adminPlans]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminPlans.filter((p) => {
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active'   &&  p.isActive)
        || (statusFilter === 'inactive' && !p.isActive);
      const matchQ = !q
        || p.id?.toLowerCase().includes(q)
        || p.name?.toLowerCase().includes(q)
        || p.description?.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [adminPlans, statusFilter, query]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = (plan) => { setEditing(plan); setFormOpen(true); };

  const handleSubmit = async (payload) => {
    const action  = editing
      ? updateAdminPlan({ id: editing.id, ...payload })
      : createAdminPlan(payload);
    const result  = await dispatch(action);
    const matcher = editing ? updateAdminPlan : createAdminPlan;
    if (matcher.fulfilled.match(result)) { setFormOpen(false); setEditing(null); }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const target = deletingTarget;
    setDeletingTarget(null);
    await dispatch(deleteAdminPlan(target.id));
  };

  /**
   * One-click status toggle from the table.
   * Sends only `isActive` so the partial update doesn't disturb anything else
   * (price, interval etc stay untouched in Stripe).
   */
  const handleToggleStatus = async (plan) => {
    if (adminPlanMutating) return;
    await dispatch(updateAdminPlan({
      id:       plan.id,
      isActive: !plan.isActive,
    }));
  };

  const isLoading = adminPlansStatus === STATUS.LOADING && adminPlans.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <PageHeader
        icon={Star}
        iconBg="#7F77DD1A"
        iconColor="#7F77DD"
        eyebrow="Admin / Subscription Plans"
        eyebrowColor="#7F77DD"
        title="Plan Catalog"
        description="Plans you create here appear in the user portal and are synced as Stripe Products & Prices. Click the status pill to activate or archive a plan."
        actions={(
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={adminSyncing}
              onClick={() => dispatch(syncAdminPlansFromStripe())}
            >
              Sync from Stripe
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              New Plan
            </Button>
          </div>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star}         label="Total plans"  value={stats.total} />
        <StatCard icon={CheckCircle2} label="Active"       value={stats.active}      color="default" />
        <StatCard icon={XCircle}      label="Archived"     value={stats.archived}    color="coral" />
        <StatCard icon={Users}        label="Subscribers"  value={stats.subscribers} sub="On any plan" />
      </div>

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search by ID, name or description...',
        }}
        filters={[{
          id: 'status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: STATUS_OPTIONS,
        }]}
      />

      <DataTable
        columns={PLAN_COLUMNS}
        rows={filtered}
        loading={isLoading}
        emptyState={<EmptyState icon={Star} title="No plans match" message="Try adjusting your filters or create a new plan." />}
        renderRow={(p) => (
          <tr key={p.id} className="hover:bg-[#FDFCF8] transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#3E3D38]">{p.name}</p>
                  <p className="text-xs text-[#9A9A94] font-mono">{p.id}</p>
                </div>
                {p.isFeatured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f5fca6] text-[#3E3D38] px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="font-unbounded text-sm font-bold text-[#3E3D38]">
                ${Number(p.price).toFixed(2)}
              </span>
              <span className="text-xs text-[#9A9A94] ml-1">{p.currency}</span>
            </td>
            <td className="px-4 py-3 text-sm text-[#3E3D38]">
              {p.intervalCount > 1 ? `Every ${p.intervalCount} ${p.interval}s` : `Per ${p.interval}`}
            </td>
            <td className="px-4 py-3 text-right text-sm font-semibold text-[#3E3D38]">
              {p.subscribersCount || 0}
            </td>
            <td className="px-4 py-3">
              {/* Clickable status pill — one click toggles Active ↔ Archived */}
              <button
                type="button"
                onClick={() => handleToggleStatus(p)}
                disabled={adminPlanMutating}
                title={p.isActive ? 'Click to archive this plan' : 'Click to activate this plan'}
                className={`text-xs font-semibold px-2 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                  p.isActive
                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-[#9A9A94] bg-[#F5F2EC] hover:bg-[#E5E0D8]'
                }`}
              >
                {p.isActive ? '● Active' : '○ Archived'}
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <IconButton
                  variant="plain"
                  aria-label="Manage features"
                  title="Manage features"
                  onClick={() => setFeaturesTarget(p)}
                  disabled={adminPlanMutating}
                >
                  <Sliders size={14} className="text-[#7F77DD]" />
                </IconButton>
                <IconButton
                  variant="plain"
                  aria-label="Edit plan"
                  title="Edit plan"
                  onClick={() => openEdit(p)}
                  disabled={adminPlanMutating}
                >
                  <Edit2 size={14} />
                </IconButton>
                <IconButton
                  variant="plain"
                  aria-label="Delete plan"
                  title="Delete plan"
                  onClick={() => setDeletingTarget(p)}
                  disabled={adminPlanMutating}
                >
                  <Trash2 size={14} className="text-rose-500" />
                </IconButton>
              </div>
            </td>
          </tr>
        )}
      />

      {formOpen && (
        <PlanForm
          plan={editing}
          saving={adminPlanMutating}
          onCancel={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {featuresTarget && (
        <PlanFeaturesModal
          plan={featuresTarget}
          onClose={() => setFeaturesTarget(null)}
        />
      )}

      {deletingTarget && (
        <ConfirmModal
          title={(deletingTarget.subscribersCount || 0) > 0 ? 'Archive plan?' : 'Delete plan?'}
          message={
            (deletingTarget.subscribersCount || 0) > 0
              ? `"${deletingTarget.name}" has ${deletingTarget.subscribersCount} active subscriber(s). It will be archived (hidden from new users) but existing subscribers stay on it until they cancel.`
              : `Permanently delete "${deletingTarget.name}"? This will archive it in Stripe.`
          }
          confirmLabel={(deletingTarget.subscribersCount || 0) > 0 ? 'Archive' : 'Delete'}
          loading={adminPlanMutating}
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}