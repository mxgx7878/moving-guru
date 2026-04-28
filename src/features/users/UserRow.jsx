import {
  Mail, MapPin, Calendar, Eye, Edit3, CheckCircle2, XCircle,
  ShieldCheck, Ban, Trash2,
} from 'lucide-react';
import { Avatar, StatusPill, IconButton } from '../../components/ui';
import { USER_STATUS_CONFIG } from '../../constants/userConstants';
import { ROLE_AVATAR_TONE } from '../../constants/theme';
import { resolveUserStatus } from './userStatus';
import RolePill from './RolePill';

// Row rendered in the admin users table. All action callbacks are
// optional — the parent wires each up to its dispatch/handler. The row
// decides which icons to show based on the user's normalised status.
export default function UserRow({
  user,
  busy = false,
  onPreview,
  onEdit,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onVerify,
  onDelete,
}) {
  const isStudio   = user.role === 'studio';
  const display    = isStudio ? (user.studio_name || user.name) : user.name;
  const status     = resolveUserStatus(user);
  const isActive   = status === 'active';
  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={display}
            src={user?.detail?.profile_picture_url || user?.detail?.profile_picture || user?.profile_picture_url || user?.profile_picture}
            tone={ROLE_AVATAR_TONE[user.role] || 'coral'}
          />
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
            <p className="text-[10px] text-[#9A9A94] mt-0.5">
              {user.last_login_at
                ? `Last seen ${new Date(user.last_login_at).toLocaleDateString()}`
                : 'Never logged in'}
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
        <StatusPill status={status} config={USER_STATUS_CONFIG} size="xs" />
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <IconButton title="View profile" onClick={onPreview}>
            <Eye size={13} />
          </IconButton>

          <IconButton title="Edit" onClick={onEdit} disabled={busy}>
            <Edit3 size={13} />
          </IconButton>

          {isPending && (
            <>
              <IconButton title="Approve" onClick={onApprove} tone="green" disabled={busy}>
                <CheckCircle2 size={13} />
              </IconButton>
              <IconButton title="Reject" onClick={onReject} tone="red" disabled={busy}>
                <XCircle size={13} />
              </IconButton>
            </>
          )}

          {isStudio && !isPending && (
            <IconButton
              title={user.is_verified ? 'Remove verification' : 'Mark verified'}
              onClick={onVerify}
              tone={user.is_verified ? 'green-active' : 'green'}
              disabled={busy}
            >
              <ShieldCheck size={13} fill={user.is_verified ? 'currentColor' : 'none'} />
            </IconButton>
          )}

          {!isPending && (
            isActive ? (
              <IconButton title="Suspend" onClick={onSuspend} tone="red" disabled={busy}>
                <Ban size={13} />
              </IconButton>
            ) : !isRejected && (
              <IconButton title="Activate" onClick={onActivate} tone="green" disabled={busy}>
                <CheckCircle2 size={13} />
              </IconButton>
            )
          )}

          <IconButton title="Delete" onClick={onDelete} tone="red" disabled={busy}>
            <Trash2 size={13} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
