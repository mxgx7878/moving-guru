import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Users, Building2, Plus } from "lucide-react";

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
  runStaleSweep,
} from "../../store/actions/instructorAction";
import {
  clearInstructorError,
  clearInstructorMessage,
  clearUserDetail,
} from "../../store/slices/instructorSlice";
import { STATUS } from "../../constants/apiConstants";

import {
  Button,
  PageHeader,
  Toolbar,
  TabBar,
  DataTable,
  EmptyState,
} from "../../components/ui";
import { UserRow, UserDetailDrawer } from "../../features/users";
import {
  SuspendUserModal,
  RejectUserModal,
  ConfirmModal,
} from "../../features/modals";
import { UserForm } from "../../features/forms";

const ROLE_TABS = [
  { id: "all", label: "All Users", icon: Users, color: "#7F77DD" },
  { id: "instructor", label: "Instructors", icon: Users, color: "#CE4F56" },
  { id: "studio", label: "Studios", icon: Building2, color: "#2DA4D6" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "suspended", label: "Suspended" },
  { id: "rejected", label: "Rejected" },
];

const ACTIVITY_FILTERS = [
  { id: "", label: "Any activity" },
  { id: "recent", label: "Logged in past week" },
  { id: "stale_30d", label: "Inactive 30+ days (auto-deactivate eligible)" },
  { id: "stale_3m", label: "Inactive 3+ months" },
];

const USER_COLUMNS = [
  { key: "user", label: "User" },
  { key: "role", label: "Role" },
  { key: "location", label: "Location" },
  { key: "joined", label: "Joined" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" },
];

export default function AdminUsers() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { users, usersStatus, userDetail, userMutating, message, error } =
    useSelector((s) => s.instructor);

  const initialRole = searchParams.get("role") || "all";

  const [roleTab, setRoleTab] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [suspendingId, setSuspendingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activityFilter, setActivityFilter] = useState("");
  const [sweeping, setSweeping] = useState(false);

  // Sync ?role=… to the active tab. Deliberately reads `searchParams`
  // through `setSearchParams`' functional form so we don't have to
  // depend on `searchParams` (which would re-trigger this effect every
  // time we update it — an infinite loop). `setSearchParams` has a
  // stable identity per-location from react-router, so leaving it out
  // of deps is safe.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (roleTab === "all") next.delete("role");
        else next.set("role", roleTab);
        return next;
      },
      { replace: true },
    );
  }, [roleTab, setSearchParams]);

  useEffect(() => {
    const params = {};
    if (roleTab !== "all") params.role = roleTab;
    if (statusFilter !== "all") params.status = statusFilter;
    if (query.trim()) params.q = query.trim();
    if (activityFilter) params.activity = activityFilter;
    dispatch(fetchAdminUsers(params));
  }, [dispatch, roleTab, statusFilter, query, activityFilter]);

  useEffect(() => {
    if (previewId) dispatch(fetchAdminUserDetail(previewId));
    else dispatch(clearUserDetail());
  }, [previewId, dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearInstructorMessage());
    }
  }, [message, dispatch]);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearInstructorError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (userMutating === STATUS.SUCCEEDED) {
      setFormOpen(false);
      setEditingUser(null);
    }
  }, [userMutating]);

  const counts = useMemo(
    () => ({
      all: users.length,
      instructor: users.filter((u) => u.role === "instructor").length,
      studio: users.filter((u) => u.role === "studio").length,
    }),
    [users],
  );

  const handleRunSweep = async () => {
    setSweeping(true);
    await dispatch(runStaleSweep());
    toast.success("Stale-user sweep complete");
    await dispatch(fetchAdminUsers({ ...buildParams() }));
    setSweeping(false);
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };
  const openEdit = (u) => {
    setEditingUser(u);
    setFormOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    if (editingUser)
      await dispatch(updateAdminUser({ id: editingUser.id, ...payload }));
    else await dispatch(createAdminUser(payload));
  };

  const handleApprove = (u) => dispatch(approveAdminUser(u.id));
  const handleVerify = (u) =>
    dispatch(verifyAdminUser({ id: u.id, is_verified: !u.is_verified }));

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
    toast.success("User activated.");
  };

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return;
    const id = deletingTarget.id;
    setDeletingTarget(null);
    if (previewId === id) setPreviewId(null);
    await dispatch(deleteAdminUser(id));
  };

  console.log(userDetail, "userDetail");

  const isLoading = usersStatus === STATUS.LOADING && users.length === 0;
  const busy = userMutating === STATUS.LOADING;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={Users}
        iconBg="#7F77DD1A"
        iconColor="#7F77DD"
        eyebrow="Admin / User Management"
        eyebrowColor="#7F77DD"
        title="Instructors & Studios"
        description="Approve signups, verify studios, suspend or remove accounts."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={openCreate}
            style={{ backgroundColor: "#7F77DD", borderColor: "#7F77DD" }}
          >
            New User
          </Button>
        }
      />

      <TabBar
        tabs={ROLE_TABS}
        activeId={roleTab}
        onChange={setRoleTab}
        counts={counts}
      />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search by name, email, studio name...",
        }}
        filters={[
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_FILTERS,
          },
          {
            id: "activity",
            value: activityFilter,
            onChange: setActivityFilter,
            options: ACTIVITY_FILTERS,
          },
        ]}
      >
        {activityFilter === "stale_30d" && (
          <Button
            variant="secondary"
            size="sm"
            icon={Zap}
            onClick={handleRunSweep}
            loading={sweeping}
            className="ml-auto hover:border-[#7F77DD] hover:text-[#7F77DD]"
          >
            Run sweep now
          </Button>
        )}
      </Toolbar>

      <DataTable
        columns={USER_COLUMNS}
        rows={users}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Users}
            title="No users found"
            message="Try adjusting your search or filters."
          />
        }
        renderRow={(u) => (
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
        )}
      />

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

      {formOpen && (
        <UserForm
          user={editingUser}
          saving={busy}
          onCancel={() => {
            setFormOpen(false);
            setEditingUser(null);
          }}
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
