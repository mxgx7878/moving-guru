import {
  MapPin, Loader2, Eye, CheckCircle2, AlertCircle, Star, Trash2,
  Clock, Zap, ZapOff,
} from 'lucide-react';
import { StatusPill, IconButton } from '../../components/ui';
import { STATUS } from '../../constants/apiConstants';
import { GROW_TYPE_META, GROW_STATUS_CONFIG } from '../../constants/growConstants';

const FEATURED_ACTIVE_CLS =
  'border-[#C9A227] text-[#C9A227] bg-[#C9A227]/10 hover:bg-[#C9A227]/10';

const toDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const formatShortDate = (val) => {
  const d = toDate(val);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function getLifecycle(post) {
  const now = Date.now();
  const expiresAt = toDate(post.expires_at);
  const boostUntil = toDate(post.boost_until);

  const isExpired = expiresAt ? expiresAt.getTime() < now : false;
  const isCurrentlyFeatured = (typeof post.is_currently_featured === 'boolean')
    ? post.is_currently_featured
    : (post.is_featured && (!boostUntil || boostUntil.getTime() > now));
  const hasExpiredBoost = !!post.is_featured
    && !!boostUntil
    && boostUntil.getTime() < now;

  return {
    isExpired,
    isCurrentlyFeatured,
    hasExpiredBoost,
    expiresAt,
    boostUntil,
  };
}

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

  const {
    isExpired,
    isCurrentlyFeatured,
    hasExpiredBoost,
    expiresAt,
    boostUntil,
  } = getLifecycle(post);

  return (
    <tr className={`border-t border-[#F0EBE3] hover:bg-[#FFFFFF] ${isExpired ? 'opacity-75' : ''}`}>
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

            {expiresAt && (
              <p
                className={`flex items-center gap-1 text-[10px] mt-1 font-semibold ${
                  isExpired ? 'text-[#1A1A1A]' : 'text-[#9A9A94]'
                }`}
                title={expiresAt.toLocaleString()}
              >
                <Clock size={9} />
                {isExpired
                  ? `Expired ${formatShortDate(expiresAt)}`
                  : `Expires ${formatShortDate(expiresAt)}`}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F4F4F4] text-[#1A1A1A] uppercase tracking-wider">
                  <AlertCircle size={9} /> Expired
                </span>
              )}

              {isCurrentlyFeatured && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F5FDA6] text-[#3E3D38] uppercase tracking-wider">
                  <Zap size={9} /> Featured
                </span>
              )}

              {hasExpiredBoost && !isCurrentlyFeatured && (
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F3F0EA] text-[#9A9A94] uppercase tracking-wider"
                  title={`Boost ran out ${formatShortDate(boostUntil)}`}
                >
                  <ZapOff size={9} /> Boost expired
                </span>
              )}
            </div>
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
        {(post.user?.email || post.contact_email) && (
          <p className="text-[10px] text-[#9A9A94]">{post.user?.email || post.contact_email}</p>
        )}
      </td>

      <td className="py-3 px-4">
        <StatusPill status={post.status} config={GROW_STATUS_CONFIG} size="xs" />
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5">
          <IconButton title="Preview" onClick={() => onPreview?.(post)}>
            <Eye size={14} />
          </IconButton>

          {post.status === 'pending' && (
            <>
              <IconButton
                title="Approve"
                onClick={() => onApprove?.(post)}
                disabled={isActing}
                className="border-coral text-coral hover:bg-coral/10"
              >
                {isActing
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
              </IconButton>
              <IconButton
                title="Reject"
                onClick={() => onReject?.(post)}
                disabled={isActing}
                className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/10"
              >
                <AlertCircle size={14} />
              </IconButton>
            </>
          )}

          {post.status === 'approved' && (
            <IconButton
              title={isCurrentlyFeatured ? 'Remove boost' : 'Boost post'}
              onClick={() => onBoost?.(post)}
              disabled={isActing}
              className={isCurrentlyFeatured ? FEATURED_ACTIVE_CLS : ''}
            >
              <Star size={14} className={isCurrentlyFeatured ? 'fill-current' : ''} />
            </IconButton>
          )}

          <IconButton
            title="Delete"
            onClick={() => onDelete?.(post)}
            disabled={isActing}
            className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/10"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
