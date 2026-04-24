import {
  MapPin, Loader2, Eye, CheckCircle2, AlertCircle, Star, Trash2,
} from 'lucide-react';
import { StatusPill, IconButton, Chip } from '../../components/ui';
import { STATUS } from '../../constants/apiConstants';
import { GROW_TYPE_META, GROW_STATUS_CONFIG } from '../../constants/growConstants';

// Reusing the shared IconButton — the "yellow-active" tone used by the
// feature button doesn't exist in the shared component, so we hand it a
// className override for the pressed look.
const FEATURED_ACTIVE_CLS =
  'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/10';

// One row in the admin grow-post moderation table. `actingId` and
// `moderationStatus` come from the redux slice so the row can show a
// spinner while that specific post is being mutated.
export default function GrowPostRow({
  post,
  actingId,
  moderationStatus,
  onPreview,
  onApprove,
  onReject,
  onBoost,
  onDelete,
}) {
  const meta     = GROW_TYPE_META[post.type] || GROW_TYPE_META.event;
  const TypeIcon = meta.icon;
  const postedBy = post.posted_by || post.postedBy || post.user?.name || '—';
  const isActing = actingId === post.id && moderationStatus === STATUS.LOADING;

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4">
        <div className="flex items-start gap-3 max-w-sm">
          <div className="flex-1 min-w-0">
            <p className="font-unbounded text-xs font-bold text-[#3E3D38] line-clamp-1">
              {post.title}
            </p>
            {post.location && (
              <p className="flex items-center gap-1 text-[11px] text-[#6B6B66] mt-0.5">
                <MapPin size={10} /> {post.location}
              </p>
            )}
            {post.is_featured && (
              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5fca6] text-[#3E3D38]">
                ⚡ FEATURED
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: meta.color + '20', color: meta.color }}
        >
          <TypeIcon size={10} /> {meta.label}
        </span>
      </td>

      <td className="py-3 px-4">
        <p className="text-xs font-semibold text-[#3E3D38]">{postedBy}</p>
        {post.user?.email && (
          <p className="text-[10px] text-[#9A9A94]">{post.user.email}</p>
        )}
      </td>

      <td className="py-3 px-4">
        <StatusPill status={post.status} config={GROW_STATUS_CONFIG} size="xs" />
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5">
          <IconButton title="Preview" onClick={() => onPreview?.(post)}>
            <Eye size={13} />
          </IconButton>

          {post.status !== 'approved' && (
            <IconButton
              title="Approve"
              onClick={() => onApprove?.(post)}
              disabled={isActing}
              tone="green"
            >
              {isActing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            </IconButton>
          )}

          {post.status !== 'rejected' && (
            <IconButton
              title="Reject"
              onClick={() => onReject?.(post)}
              disabled={isActing}
              tone="red"
            >
              <AlertCircle size={13} />
            </IconButton>
          )}

          <IconButton
            title={post.is_featured ? 'Remove feature' : 'Feature post'}
            onClick={() => onBoost?.(post)}
            className={post.is_featured ? FEATURED_ACTIVE_CLS : 'border-[#E5E0D8] text-[#F59E0B] hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]'}
          >
            <Star size={13} fill={post.is_featured ? 'currentColor' : 'none'} />
          </IconButton>

          <IconButton
            title="Delete"
            onClick={() => onDelete?.(post)}
            disabled={isActing}
            tone="red"
          >
            <Trash2 size={13} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
