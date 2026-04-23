import { Loader2 } from 'lucide-react';
import {
  ShieldCheck, AlertCircle, XCircle, Sparkles, Edit3,
  CheckCircle2, Ban, Trash2,
} from 'lucide-react';
import {
  Drawer, Avatar, Chip, StatusPill, StatTile, LabeledBlock, InfoRow, Button,
} from '../../components/ui';
import { USER_STATUS_CONFIG } from '../../constants/userConstants';
import { resolveUserStatus } from './userStatus';

const HEADER_BG = {
  studio:     'bg-[#2DA4D6]/10',
  admin:      'bg-[#7F77DD]/10',
  instructor: 'bg-[#CE4F56]/10',
};

const AVATAR_TONE = {
  studio:     'blue',
  admin:      'purple',
  instructor: 'coral',
};

// Full detail/moderation drawer for a user. Takes callbacks for each
// admin action; renders a status-specific callout + footer actions.
export default function UserDetailDrawer({
  user,
  busy = false,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onVerify,
  onDelete,
}) {
  if (!user) {
    return (
      <Drawer
        open
        onClose={onClose}
        loading
        loadingSpinner={<Loader2 size={26} className="animate-spin text-[#7F77DD]" />}
      />
    );
  }

  const isStudio   = user.role === 'studio';
  const display    = isStudio ? (user.studio_name || user.name) : user.name;
  const status     = resolveUserStatus(user);
  const isActive   = status === 'active';
  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  const header = (
    <div className="flex items-center gap-4">
      <Avatar name={display} size="lg" shape="square" tone={AVATAR_TONE[user.role] || 'coral'} />
      <div>
        <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38] flex items-center gap-2">
          {display}
          {user.is_verified && (
            <Chip tone="emerald" size="xs" icon={ShieldCheck}>VERIFIED</Chip>
          )}
        </h2>
        <p className="text-[11px] text-[#6B6B66] capitalize">
          {user.role} · {user.email}
        </p>
        <div className="mt-1">
          <StatusPill status={status} config={USER_STATUS_CONFIG} size="xs" />
        </div>
      </div>
    </div>
  );

  const footer = (
    <>
      <Button variant="secondary" size="sm" icon={Edit3} onClick={() => onEdit?.(user)} disabled={busy}>
        Edit
      </Button>

      {isPending && (
        <>
          <Button variant="outlineDanger" size="sm" icon={XCircle} onClick={onReject} disabled={busy}>
            Reject
          </Button>
          <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => onApprove?.(user)} disabled={busy}>
            Approve
          </Button>
        </>
      )}

      {isStudio && !isPending && (
        <Button
          variant={user.is_verified ? 'successSoft' : 'secondary'}
          size="sm"
          icon={ShieldCheck}
          onClick={() => onVerify?.(user)}
          disabled={busy}
          className={user.is_verified ? '' : 'hover:border-emerald-500 hover:text-emerald-600'}
        >
          {user.is_verified ? 'Verified' : 'Mark Verified'}
        </Button>
      )}

      {!isPending && (
        isActive ? (
          <Button variant="secondary" size="sm" icon={Ban} onClick={onSuspend} disabled={busy}
            className="hover:border-[#EF4444] hover:text-[#EF4444]">
            Suspend
          </Button>
        ) : !isRejected && (
          <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => onActivate?.(user)} disabled={busy}
            className="hover:border-emerald-500 hover:text-emerald-600">
            Activate
          </Button>
        )
      )}

      <Button variant="outlineDanger" size="sm" icon={Trash2} onClick={() => onDelete?.(user)} disabled={busy}>
        Delete
      </Button>
    </>
  );

  return (
    <Drawer
      open
      onClose={onClose}
      size="lg"
      header={header}
      headerClassName={HEADER_BG[user.role] || HEADER_BG.instructor}
      footer={footer}
    >
      {(user.bio || user.description) && (
        <LabeledBlock label="About">
          <p className="text-sm text-[#3E3D38] whitespace-pre-line">
            {user.bio || user.description}
          </p>
        </LabeledBlock>
      )}

      <div className="grid grid-cols-2 gap-4 text-xs">
        <InfoRow label="Phone"      value={user.phone} />
        <InfoRow label="Location"   value={user.location} />
        <InfoRow label="Joined"     value={user.created_at ? new Date(user.created_at).toLocaleDateString() : null} />
        <InfoRow label="Last login" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : null} />
      </div>

      {(user.disciplines || []).length > 0 && (
        <LabeledBlock label="Disciplines">
          <div className="flex flex-wrap gap-1.5">
            {user.disciplines.map((d) => <Chip key={d} size="xs">{d}</Chip>)}
          </div>
        </LabeledBlock>
      )}

      {isStudio && (user.amenities || []).length > 0 && (
        <LabeledBlock label="Amenities">
          <div className="flex flex-wrap gap-1.5">
            {user.amenities.map((a) => <Chip key={a} size="xs">{a}</Chip>)}
          </div>
        </LabeledBlock>
      )}

      <div className="grid grid-cols-3 gap-3">
        {isStudio ? (
          <>
            <StatTile label="Job listings" value={user.stats?.jobs_count} />
            <StatTile label="Saved by"     value={user.stats?.saved_by_count} />
            <StatTile label="Grow posts"   value={user.stats?.grow_posts_count} />
          </>
        ) : (
          <>
            <StatTile label="Job applications" value={user.stats?.applications_count} />
            <StatTile label="Saved by studios" value={user.stats?.saved_by_count} />
            <StatTile label="Grow posts"       value={user.stats?.grow_posts_count} />
          </>
        )}
      </div>

      {user.suspended_at && user.suspension_reason && (
        <StatusCallout
          tone="red"
          icon={AlertCircle}
          title={`Suspended ${new Date(user.suspended_at).toLocaleDateString()}`}
          body={user.suspension_reason}
        />
      )}

      {user.rejection_reason && isRejected && (
        <StatusCallout
          tone="red"
          icon={XCircle}
          title={`Registration Rejected${user.rejected_at ? ` · ${new Date(user.rejected_at).toLocaleDateString()}` : ''}`}
          body={user.rejection_reason}
        />
      )}

      {isPending && (
        <StatusCallout
          tone="yellow"
          icon={Sparkles}
          title="Awaiting Approval"
          body="Review the profile above and approve or reject to let them access the platform."
        />
      )}
    </Drawer>
  );
}

const CALLOUT_TONE = {
  red:    'bg-red-50 border-red-100 text-red-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

function StatusCallout({ tone = 'red', icon: Icon, title, body }) {
  return (
    <div className={`border rounded-xl p-3 ${CALLOUT_TONE[tone] || CALLOUT_TONE.red}`}>
      <p className="text-[10px] uppercase tracking-wide font-bold flex items-center gap-1">
        <Icon size={11} /> {title}
      </p>
      <p className="text-xs mt-0.5">{body}</p>
    </div>
  );
}
