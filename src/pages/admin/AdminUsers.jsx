import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  Users, Building2, Search, X, Filter, Eye, Loader2, Trash2, Plus, Edit3,
  ShieldCheck, Ban, CheckCircle2, Mail, MapPin, Calendar,
  AlertCircle, Sparkles, XCircle,
} from 'lucide-react';

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
import { Button } from '../../components/ui';
import {
  SuspendUserModal, RejectUserModal, ConfirmModal,
} from '../../features/modals';
import { UserForm } from '../../features/forms';

// ── Constants ────────────────────────────────────────────────────
const ROLE_TABS = [
  { id: 'all',        label: 'All Users',   icon: Users,     color: '#7F77DD' },
  { id: 'instructor', label: 'Instructors', icon: Users,     color: '#CE4F56' },
  { id: 'studio',     label: 'Studios',     icon: Building2, color: '#2DA4D6' },
];

const STATUS_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'pending',   label: 'Pending' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'rejected',  label: 'Rejected' },
];

// Normalise status so rows work whether backend sends `status` or `is_active`
const resolveStatus = (u) =>
  u.status || (u.is_active === false ? 'suspended' : 'active');

// ═══════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════
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
    if (error) { toast.error(error); dispatch(clearInstructorError()); }
  }, [error, dispatch]);

   useEffect(() => {
    if (userMutating === STATUS.SUCCEEDED) {
      setFormOpen(false);
      setEditingUser(null);
    }
  }, [userMutating]);

  // ── Counts (per-role-tab) ─────────────────────────────────────
  const counts = useMemo(() => ({
    all:        users.length,
    instructor: users.filter((u) => u.role === 'instructor').length,
    studio:     users.filter((u) => u.role === 'studio').length,
  }), [users]);

  // ═══════════════════════════════════════════════════════════════
  //  Handlers — each tries the API, falls back to local mutation so
  //  the UI still updates when the backend endpoint isn't live yet.
  // ═══════════════════════════════════════════════════════════════

  const openCreate = () => { setEditingUser(null); setFormOpen(true); };
  const openEdit   = (u) => { setEditingUser(u);   setFormOpen(true); };

 const handleSubmitForm = async (payload) => {
    if (editingUser) {
      await dispatch(updateAdminUser({ id: editingUser.id, ...payload }));
    } else {
      await dispatch(createAdminUser(payload));
    }
    // Only close on success — error surfaces via toast, form stays open
    // (similar pattern to AdminPosts).
  };

  const handleApprove   = (u) => dispatch(approveAdminUser(u.id));

  const handleVerify = (u) => {
    dispatch(verifyAdminUser({ id: u.id, is_verified: !u.is_verified }));
  };

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

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const id = deletingTarget.id;
    setDeletingTarget(null);
    if (previewId === id) setPreviewId(null);
    await dispatch(deleteAdminUser(id));
  };
  const handleActivate = async (u) => {
    const res = await dispatch(activateAdminUser(u.id));
      toast.success('User activated.');
    }
  

  const isLoading = usersStatus === STATUS.LOADING && users.length === 0;
  const busy      = userMutating === STATUS.LOADING;

  // ═══════════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════════
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

        <Button variant="primary" icon={Plus} onClick={openCreate}
          style={{ backgroundColor: '#7F77DD', borderColor: '#7F77DD' }}>
          New User
        </Button>
      </div>

      {/* ── Role tabs ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((t) => {
          const Icon = t.icon;
          const active = roleTab === t.id;
          return (
            <button key={t.id} onClick={() => setRoleTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
                ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
              style={active ? { backgroundColor: t.color } : {}}>
              <Icon size={13} /> {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + status filter ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px]">
          <Search size={16} className="text-[#9A9A94]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, studio name..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-[#9A9A94]" /></button>}
        </div>
        <div className="flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#9A9A94]" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2">
            {STATUS_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={26} className="animate-spin text-[#7F77DD]" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-[#C4BCB4] mb-3" />
            <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">No users found</p>
            <p className="text-[#9A9A94] text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
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
                  <UserRow key={u.id} user={u} busy={busy}
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

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function UserRow({
  user, busy,
  onPreview, onEdit, onApprove, onReject,
  onSuspend, onActivate, onVerify, onDelete,
}) {
  const isStudio = user.role === 'studio';
  const display  = isStudio ? (user.studio_name || user.name) : user.name;
  const initials = (display || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const status   = resolveStatus(user);
  const isActive = status === 'active';
  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0
            ${isStudio ? 'bg-[#2DA4D6]' : user.role === 'admin' ? 'bg-[#7F77DD]' : 'bg-[#CE4F56]'}`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#3E3D38] text-xs flex items-center gap-1.5">
              {display}
              {user.is_verified && (
                <span title="Verified"><ShieldCheck size={11} className="text-emerald-600" /></span>
              )}
            </p>
            <p className="text-[10px] text-[#9A9A94] flex items-center gap-1">
              <Mail size={9} /> {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <RolePill role={user.role} />
      </td>
      <td className="py-3 px-4">
        {user.location ? (
          <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
            <MapPin size={11} /> {user.location}
          </span>
        ) : <span className="text-xs text-[#C4BCB4]">—</span>}
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
          <Calendar size={11} className="text-[#9A9A94]" />
          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
        </span>
      </td>
      <td className="py-3 px-4">
        <StatusPill status={status} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <IconBtn title="View profile" onClick={onPreview}>
            <Eye size={13} />
          </IconBtn>

          <IconBtn title="Edit" onClick={onEdit} disabled={busy}>
            <Edit3 size={13} />
          </IconBtn>

          {/* Approval flow — only for pending users */}
          {isPending && (
            <>
              <IconBtn title="Approve" onClick={onApprove} color="green" disabled={busy}>
                <CheckCircle2 size={13} />
              </IconBtn>
              <IconBtn title="Reject" onClick={onReject} color="red" disabled={busy}>
                <XCircle size={13} />
              </IconBtn>
            </>
          )}

          {/* Verify toggle — studios only, not pending */}
          {isStudio && !isPending && (
            <IconBtn
              title={user.is_verified ? 'Remove verification' : 'Mark verified'}
              onClick={onVerify}
              color={user.is_verified ? 'green-active' : 'green'}
              disabled={busy}>
              <ShieldCheck size={13} fill={user.is_verified ? 'currentColor' : 'none'} />
            </IconBtn>
          )}

          {/* Suspend / Activate — not available in pending state */}
          {!isPending && (
            isActive ? (
              <IconBtn title="Suspend" onClick={onSuspend} color="red" disabled={busy}>
                <Ban size={13} />
              </IconBtn>
            ) : !isRejected && (
              <IconBtn title="Activate" onClick={onActivate} color="green" disabled={busy}>
                <CheckCircle2 size={13} />
              </IconBtn>
            )
          )}

          <IconBtn title="Delete" onClick={onDelete} color="red" disabled={busy}>
            <Trash2 size={13} />
          </IconBtn>
        </div>
      </td>
    </tr>
  );
}

// ───────────────────────────────────────────────────────────────
function UserDetailDrawer({
  user, busy, onClose,
  onEdit, onApprove, onReject,
  onSuspend, onActivate, onVerify, onDelete,
}) {
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-10">
          <Loader2 size={26} className="animate-spin text-[#7F77DD]" />
        </div>
      </div>
    );
  }

  const isStudio = user.role === 'studio';
  const display  = isStudio ? (user.studio_name || user.name) : user.name;
  const initials = (display || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const status   = resolveStatus(user);
  const isActive = status === 'active';
  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">

        {/* Header */}
        <div className={`px-6 py-5 rounded-t-2xl flex items-center justify-between
          ${isStudio ? 'bg-[#2DA4D6]/10' : user.role === 'admin' ? 'bg-[#7F77DD]/10' : 'bg-[#CE4F56]/10'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-['Unbounded'] font-black text-sm
              ${isStudio ? 'bg-[#2DA4D6]' : user.role === 'admin' ? 'bg-[#7F77DD]' : 'bg-[#CE4F56]'}`}>
              {initials}
            </div>
            <div>
              <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38] flex items-center gap-2">
                {display}
                {user.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={10} /> VERIFIED
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#6B6B66] capitalize">
                {user.role} · {user.email}
              </p>
              <StatusPill status={status} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg text-[#6B6B66]">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {(user.bio || user.description) && (
            <Section label="About">
              <p className="text-sm text-[#3E3D38] whitespace-pre-line">{user.bio || user.description}</p>
            </Section>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <Info label="Phone"       value={user.phone} />
            <Info label="Location"    value={user.location} />
            <Info label="Joined"      value={user.created_at ? new Date(user.created_at).toLocaleDateString() : null} />
            <Info label="Last login"  value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : null} />
          </div>

          {(user.disciplines || []).length > 0 && (
            <Section label="Disciplines">
              <div className="flex flex-wrap gap-1.5">
                {user.disciplines.map((d) => (
                  <span key={d} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                    {d}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {isStudio && (user.amenities || []).length > 0 && (
            <Section label="Amenities">
              <div className="flex flex-wrap gap-1.5">
                {user.amenities.map((a) => (
                  <span key={a} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#6B6B66]">
                    {a}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <div className="grid grid-cols-3 gap-3">
            {isStudio ? (
              <>
                <Counter label="Job listings"  value={user.stats?.jobs_count} />
                <Counter label="Saved by"      value={user.stats?.saved_by_count} />
                <Counter label="Grow posts"    value={user.stats?.grow_posts_count} />
              </>
            ) : (
              <>
                <Counter label="Job applications" value={user.stats?.applications_count} />
                <Counter label="Saved by studios" value={user.stats?.saved_by_count} />
                <Counter label="Grow posts"       value={user.stats?.grow_posts_count} />
              </>
            )}
          </div>

          {/* Status-specific callouts */}
          {user.suspended_at && user.suspension_reason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-[10px] text-red-600 uppercase tracking-wide font-bold flex items-center gap-1">
                <AlertCircle size={11} /> Suspended {new Date(user.suspended_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-red-700 mt-0.5">{user.suspension_reason}</p>
            </div>
          )}

          {user.rejection_reason && isRejected && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-[10px] text-red-600 uppercase tracking-wide font-bold flex items-center gap-1">
                <XCircle size={11} /> Registration Rejected
                {user.rejected_at && ` · ${new Date(user.rejected_at).toLocaleDateString()}`}
              </p>
              <p className="text-xs text-red-700 mt-0.5">{user.rejection_reason}</p>
            </div>
          )}

          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-[10px] text-yellow-700 uppercase tracking-wide font-bold flex items-center gap-1">
                <Sparkles size={11} /> Awaiting Approval
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Review the profile above and approve or reject to let them access the platform.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions — adapt to state */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] flex flex-wrap justify-end gap-2">

          <button onClick={() => onEdit(user)} disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38] transition-colors disabled:opacity-60">
            <Edit3 size={13} /> Edit
          </button>

          {isPending && (
            <>
              <button onClick={onReject} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#EF4444] hover:bg-[#EF4444]/5 hover:border-[#EF4444] transition-colors disabled:opacity-60">
                <XCircle size={13} /> Reject
              </button>
              <button onClick={() => onApprove(user)} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-60">
                <CheckCircle2 size={13} /> Approve
              </button>
            </>
          )}

          {isStudio && !isPending && (
            <button onClick={() => onVerify(user)} disabled={busy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-60
                ${user.is_verified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-[#E5E0D8] text-[#6B6B66] hover:border-emerald-500 hover:text-emerald-600'}`}>
              <ShieldCheck size={13} />
              {user.is_verified ? 'Verified' : 'Mark Verified'}
            </button>
          )}

          {!isPending && (
            isActive ? (
              <button onClick={onSuspend} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#6B6B66] hover:border-[#EF4444] hover:text-[#EF4444] transition-colors disabled:opacity-60">
                <Ban size={13} /> Suspend
              </button>
            ) : !isRejected && (
              <button onClick={() => onActivate(user)} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#6B6B66] hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-60">
                <CheckCircle2 size={13} /> Activate
              </button>
            )
          )}

          <button onClick={() => onDelete(user)} disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] text-[#EF4444] hover:bg-[#EF4444]/5 hover:border-[#EF4444] transition-colors disabled:opacity-60">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
function RolePill({ role }) {
  const cfg = {
    instructor: { icon: Users,     bg: 'bg-[#CE4F56]/15', text: 'text-[#CE4F56]', label: 'Instructor' },
    studio:     { icon: Building2, bg: 'bg-[#2DA4D6]/15', text: 'text-[#2DA4D6]', label: 'Studio' },
    admin:      { icon: ShieldCheck, bg: 'bg-[#7F77DD]/15', text: 'text-[#7F77DD]', label: 'Admin' },
  }[role] || { icon: Users, bg: 'bg-gray-100', text: 'text-gray-600', label: role || '—' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = {
    active:    { label: 'Active',    icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
    suspended: { label: 'Suspended', icon: Ban,          cls: 'bg-red-50 text-red-700 border-red-200'          },
    pending:   { label: 'Pending',   icon: Sparkles,     cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    rejected:  { label: 'Rejected',  icon: XCircle,      cls: 'bg-red-50 text-red-700 border-red-200'          },
  }[status] || { label: status || 'Unknown', icon: AlertCircle, cls: 'bg-gray-50 text-gray-700 border-gray-200' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${cfg.cls}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function IconBtn({ children, title, onClick, disabled, color = 'default' }) {
  const colorCls = {
    default:        'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]',
    green:          'border-[#E5E0D8] text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500',
    'green-active': 'border-emerald-500 text-emerald-600 bg-emerald-50',
    red:            'border-[#E5E0D8] text-red-500 hover:bg-red-50 hover:border-red-500',
  }[color];
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorCls}`}>
      {children}
    </button>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-0.5">{label}</p>
      <p className="text-[#3E3D38]">{value || <span className="text-[#C4BCB4]">—</span>}</p>
    </div>
  );
}

function Counter({ label, value }) {
  return (
    <div className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3 text-center">
      <p className="font-['Unbounded'] text-base font-black text-[#3E3D38]">{value ?? '—'}</p>
      <p className="text-[10px] font-semibold text-[#9A9A94]">{label}</p>
    </div>
  );
}