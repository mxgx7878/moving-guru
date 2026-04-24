import {
  MapPin, Calendar, Clock, Clock3, MessageCircle, Building2,
  Star, Check, Trash2, CheckCircle2, XCircle,
} from 'lucide-react';
import { Avatar, Button } from '../../components/ui';
import { formatShortDate } from '../../utils/formatters';

// Card rendered in the instructor's My Applications list.
// Callbacks are optional — the parent wires message / review / withdraw.
const STATUS_META = {
  accepted: { label: 'Accepted',          bg: 'bg-emerald-50',   text: 'text-emerald-600', icon: CheckCircle2 },
  rejected: { label: 'Not selected',      bg: 'bg-red-50',       text: 'text-red-500',     icon: XCircle      },
  viewed:   { label: 'Studio has viewed', bg: 'bg-[#FBF8E4]',    text: 'text-[#6B6B66]',   icon: Clock        },
  pending:  { label: 'Pending',           bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]',   icon: Clock3       },
};

export default function ApplicationCard({
  app,
  job,
  studio,
  studioName,
  reviewed,
  isWithdrawing,
  onReview,
  onWithdraw,
  onMessage,
}) {
  const statusCfg = STATUS_META[app.status] || STATUS_META.pending;
  const StatusIcon = statusCfg.icon;

  const appliedOn = formatShortDate(app.created_at);
  const canReapplyAt = formatShortDate(app.can_reapply_at);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 hover:border-[#CE4F56]/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar
          name={studioName}
          src={studio.detail?.profile_picture || studio.profile_picture}
          size="md"
          shape="square"
          tone="blue"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-unbounded text-sm font-black text-[#3E3D38] truncate">
              {job.title || 'Untitled listing'}
            </p>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
              <StatusIcon size={12} /> {statusCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] mt-1 flex-wrap">
            <Building2 size={11} className="text-[#9A9A94]" />
            <span className="font-semibold">{studioName}</span>
            {job.location && (
              <>
                <span className="text-[#C4BCB4]">·</span>
                <MapPin size={11} className="text-[#9A9A94]" />
                <span>{job.location}</span>
              </>
            )}
            {appliedOn && (
              <>
                <span className="text-[#C4BCB4]">·</span>
                <Calendar size={11} className="text-[#9A9A94]" />
                <span className="text-[#9A9A94]">Applied {appliedOn}</span>
              </>
            )}
          </div>

          {app.status === 'rejected' && canReapplyAt && (
            <p className="mt-2 text-[11px] text-[#9A9A94] flex items-center gap-1">
              <Clock3 size={10} /> You can re-apply after {canReapplyAt}.
            </p>
          )}

          {app.message && (
            <details className="mt-2">
              <summary className="text-[11px] text-[#9A9A94] cursor-pointer hover:text-[#6B6B66]">
                View your message
              </summary>
              <p className="mt-1 text-[#6B6B66] text-xs leading-relaxed whitespace-pre-line bg-[#FBF8E4] rounded-xl px-3 py-2">
                {app.message}
              </p>
            </details>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-edge flex-wrap">
        <Button variant="secondary" size="xs" icon={MessageCircle} onClick={onMessage}
          className="hover:border-sky-mg hover:text-sky-mg">
          Message
        </Button>

        <div className="flex-1" />

        {app.status === 'accepted' && reviewed && (
          <Button variant="successSoft" size="xs" icon={Check} state="static"
            title="You've already reviewed this studio for this listing">
            Reviewed
          </Button>
        )}
        {app.status === 'accepted' && !reviewed && studio.id && (
          <Button variant="danger" size="xs" icon={Star} onClick={onReview}>
            Leave Review
          </Button>
        )}

        {(app.status === 'pending' || app.status === 'viewed') && (
          <Button
            variant="secondary"
            size="xs"
            icon={Trash2}
            loading={isWithdrawing}
            disabled={isWithdrawing}
            onClick={onWithdraw}
            className="hover:border-red-500 hover:text-red-500"
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
