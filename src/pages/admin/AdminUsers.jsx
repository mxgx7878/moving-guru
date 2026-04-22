import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Users, Building2, Plus } from 'lucide-react';

import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  createAdminUser,
  updateAdminUser,
  approveAdminUser,
  rejectAdminUser,
  suspendAdminUser,
  activateAdminUser,
  verifyAdminUser,
  deleteAdminUser,
} from '../../store/actions/instructorAction';
import {
  clearInstructorError,
  clearInstructorMessage,
  clearUserDetail,
} from '../../store/slices/instructorSlice';
import { STATUS } from '../../constants/apiConstants';

import {
  Button, SearchBar, FilterSelect, TabBar, EmptyState,
} from '../../components/ui';
import { UserRow, UserDetailDrawer } from '../../features/users';
import {
  SuspendUserModal, RejectUserModal, ConfirmModal,
} from '../../features/modals';
import { UserForm } from '../../features/forms';

const ROLE_TABS = [
  { id: 'all',        label: 'All Users',   icon: Users,     color: '#7F77DD' },
  { id: 'instructor', label: 'Instructors', icon: Users,     color: '#CE4F56' },
  { id: 'studio',     label: 'Studios',     icon: Building2, color: '#2DA4D6' },
];

const STATUS_FILTERS = [
  { id: 'all',       label: 'All'       },
  { id: 'active',    label: 'Active'    },
  { id: 'pending',   label: 'Pending'   },
  { id: 'suspended', label: 'Suspended' },
  { id: 'rejected',  label: 'Rejected'  },
];

export default function AdminUsers() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    users, usersStatus, userDetail, userMutating, message, error,
  } = useSelector((s) => s.instructor);

  const initialRole = searchParams.get('role') || 'all';

  const [roleTab,      setRoleTab]      = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query,        setQuery]        = useState('');

  // Modal / drawer state
  const [previewId,      setPreviewId]      = useState(null);
  const [suspendingId,   setSuspendingId]   = useState(null);
  const [rejectingId,    setRejectingId]    = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [formOpen,       setFormOpen]       = useState(false);
  const [editingUser,    setEditingUser]    = useState(null);

  // ── Sync URL ↔ role tab ───────────────────────────────────────
  useEffect(() => {
    if (roleTab === 'all') searchParams.delete('role');
    else                   searchParams.set('role', roleTab);
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleTab]);

  // ── Fetch users when filters change ────────────────────────────
  useEffect(() => {
    const params = {};
    if (roleTab      !== 'all') params.role   = roleTab;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (query.trim())           params.q      = query.trim();
    dispatch(fetchAdminUsers(params));
  }, [dispatch, roleTab, statusFilter, query]);

  // ── Fetch detail when preview opens ────────────────────────────
  useEffect(() => {
    if (previewId) dispatch(fetchAdminUserDetail(previewId));
    else           dispatch(clearUserDetail());
  }, [previewId, dispatch]);

  // ── Toasts ────────────────────────────────────────────────────
  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearInstructorMessage()); }
  }, [message, dispatch]);
  useEffect(() => {
    if (error)   { toast.error(error);     dispatch(clearInstructorError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (userMutating === STATUS.SUCCEEDED) {
      setFormOpen(false);
      setEditingUser(null);
    }
  }, [userMutating]);

  // Counts for the role tabs
  const counts = useMemo(() => ({
    all:        users.length,
    instructor: users.filter((u) => u.role === 'instructor').length,
    studio:     users.filter((u) => u.role === 'studio').length,
  }), [users]);

  // ── Handlers ──────────────────────────────────────────────────
  const openCreate = () => { setEditingUser(null); setFormOpen(true); };
  const openEdit   = (u) => { setEditingUser(u);   setFormOpen(true); };

  const handleSubmitForm = async (payload) => {
    if (editingUser) {
      await dispatch(updateAdminUser({ id: editingUser.id, ...payload }));
    } else {
      await dispatch(createAdminUser(payload));
    }
    // Close-on-success is handled by the userMutating effect above.
  };

  const handleApprove = (u) => dispatch(approveAdminUser(u.id));
  const handleVerify  = (u) => dispatch(verifyAdminUser({ id: u.id, is_verified: !u.is_verified }));

  const handleReject = async (reason) => {
    if (!rejectingId) return;
    const id = rejectingId;
    setRejectingId(null);
    await dispatch(rejectAdminUser({ id, reason }));
  };

  const handleSuspend = async (reason) => {
    if (!suspendingId) return;
    const id = suspendingId;
    setSuspendingId(null);
    await dispatch(suspendAdminUser({ id, reason }));
  };

  const handleActivate = async (u) => {
    await dispatch(activateAdminUser(u.id));
    toast.success('User activated.');
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const id = deletingTarget.id;
    setDeletingTarget(null);
    if (previewId === id) setPreviewId(null);
    await dispatch(deleteAdminUser(id));
  };

  const isLoading = usersStatus === STATUS.LOADING && users.length === 0;
  const busy      = userMutating === STATUS.LOADING;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7F77DD]/10 rounded-2xl flex items-center justify-center">
            <Users size={22} className="text-[#7F77DD]" />
          </div>
          <div>
            <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-1">
              Admin &nbsp;/&nbsp; User Management
            </p>
            <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">
              Instructors &amp; Studios
            </h1>
            <p className="text-[#6B6B66] text-xs mt-0.5">
              Approve signups, verify studios, suspend or remove accounts.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={openCreate}
          style={{ backgroundColor: '#7F77DD', borderColor: '#7F77DD' }}
        >
          New User
        </Button>
      </div>

      {/* ── Role tabs ────────────────────────────────────────── */}
      <TabBar
        tabs={ROLE_TABS}
        activeId={roleTab}
        onChange={setRoleTab}
        counts={counts}
      />

      {/* ── Search + status filter ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name, email, studio name..."
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTERS}
        />
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            message="Try adjusting your search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCF8] text-left">
                <tr className="text-[10px] text-[#9A9A94] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    busy={busy}
                    onPreview={() => setPreviewId(u.id)}
                    onEdit={() => openEdit(u)}
                    onApprove={() => handleApprove(u)}
                    onReject={() => setRejectingId(u.id)}
                    onSuspend={() => setSuspendingId(u.id)}
                    onActivate={() => handleActivate(u)}
                    onVerify={() => handleVerify(u)}
                    onDelete={() => setDeletingTarget(u)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────── */}
      {previewId && (
        <UserDetailDrawer
          user={userDetail || users.find((u) => u.id === previewId)}
          busy={busy}
          onClose={() => setPreviewId(null)}
          onEdit={openEdit}
          onApprove={handleApprove}
          onReject={() => setRejectingId(previewId)}
          onSuspend={() => setSuspendingId(previewId)}
          onActivate={handleActivate}
          onVerify={handleVerify}
          onDelete={(u) => setDeletingTarget(u)}
        />
      )}

      {/* ── Modals ─────────────────────────────────────────────── */}
      {formOpen && (
        <UserForm
          user={editingUser}
          saving={busy}
          onCancel={() => { setFormOpen(false); setEditingUser(null); }}
          onSubmit={handleSubmitForm}
        />
      )}

      {suspendingId && (
        <SuspendUserModal
          busy={busy}
          onCancel={() => setSuspendingId(null)}
          onConfirm={handleSuspend}
        />
      )}

      {rejectingId && (
        <RejectUserModal
          busy={busy}
          onCancel={() => setRejectingId(null)}
          onConfirm={handleReject}
        />
      )}

      {deletingTarget && (
        <ConfirmModal
          title="Delete user?"
          message={`Permanently delete "${deletingTarget.studio_name || deletingTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          loading={busy}
          onCancel={() => setDeletingTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
