import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flag, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { fetchAdminReports, updateReportStatus } from '../../store/actions/reportAction';
import { STATUS } from '../../constants/apiConstants';
import {
  PageHeader, TabBar, Toolbar, DataTable, EmptyState, Modal, Button, Avatar,
} from '../../components/ui';

/* ── Meta maps ─────────────────────────────────────────────── */
const REASON_META = {
  harassment:       { label: 'Harassment',     cls: 'bg-amber-100 text-amber-700'  },
  spam:             { label: 'Spam',           cls: 'bg-gray-100 text-gray-600'    },
  sexual_content:   { label: 'Sexual content', cls: 'bg-red-100 text-red-700'      },
  hate_speech:      { label: 'Hate speech',    cls: 'bg-red-100 text-red-700'      },
  scam_fraud:       { label: 'Scam / fraud',   cls: 'bg-orange-100 text-orange-700'},
  threats_violence: { label: 'Threats',        cls: 'bg-red-100 text-red-700'      },
  other:            { label: 'Other',          cls: 'bg-gray-100 text-gray-600'    },
};

const STATUS_META = {
  pending:   { label: 'Pending',   cls: 'bg-coral/15 text-coral'         },
  reviewed:  { label: 'Reviewed',  cls: 'bg-blue-100 text-blue-700'      },
  resolved:  { label: 'Resolved',  cls: 'bg-[#DBFFA9] text-[#3F6216]'    },
  dismissed: { label: 'Dismissed', cls: 'bg-gray-100 text-gray-500'      },
};

const STATUS_TABS = [
  { id: 'all',       label: 'All'       },
  { id: 'pending',   label: 'Pending'   },
  { id: 'reviewed',  label: 'Reviewed'  },
  { id: 'resolved',  label: 'Resolved'  },
  { id: 'dismissed', label: 'Dismissed' },
];

const REASON_FILTER_OPTIONS = [
  { id: 'all',              label: 'All reasons'           },
  { id: 'harassment',       label: 'Harassment or bullying'},
  { id: 'spam',             label: 'Spam'                  },
  { id: 'sexual_content',   label: 'Sexual content'        },
  { id: 'hate_speech',      label: 'Hate speech'           },
  { id: 'scam_fraud',       label: 'Scam / fraud'          },
  { id: 'threats_violence', label: 'Threats or violence'   },
  { id: 'other',            label: 'Other'                 },
];

const REPORT_COLUMNS = [
  { key: 'reported', label: 'Reported user' },
  { key: 'reason',   label: 'Reason'        },
  { key: 'type',     label: 'Type'          },
  { key: 'reporter', label: 'Reported by'   },
  { key: 'when',     label: 'When'          },
  { key: 'status',   label: 'Status'        },
  { key: 'actions',  label: '', align: 'right' },
];

/* ── Helpers ───────────────────────────────────────────────── */
const personName = (u) => {
  if (!u) return 'Unknown';
  if (u.role === 'admin') return 'Moving Guru';
  if (u.role === 'studio') return u.detail?.studioName || u.name || 'Studio';
  return u.name || 'Unknown';
};
const personAvatar = (u) => u?.detail?.profile_picture_url || null;

const timeAgo = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};
const fmtFull = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

/* ════════════════════════════════════════════════════════════ */
export default function AdminReports() {
  const dispatch = useDispatch();
  const adminReports   = useSelector((s) => s.report.adminReports);
  const adminStatus    = useSelector((s) => s.report.adminStatus);
  const statusUpdating = useSelector((s) => s.report.statusUpdating);

  const [statusTab, setStatusTab]       = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [query, setQuery]               = useState('');
  const [detailId, setDetailId]         = useState(null);

  const load = () =>
    dispatch(fetchAdminReports(statusTab === 'all' ? {} : { status: statusTab }));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminReports.filter((r) => {
      if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
      if (!q) return true;
      const hay = [
        personName(r.reportedUser),
        personName(r.reporter),
        r.reportedUser?.email || '',
        r.reportedMessage?.body || '',
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [adminReports, reasonFilter, query]);

  const detail = useMemo(
    () => adminReports.find((r) => r.id === detailId) || null,
    [adminReports, detailId],
  );

  const handleUpdateStatus = async (id, status) => {
    try {
      await dispatch(updateReportStatus({ id, status })).unwrap();
      toast.success(`Marked as ${status}.`);
      // On a filtered tab the row no longer belongs here — refetch so it
      // drops off (and the detail modal closes, since detail = find-by-id).
      if (statusTab !== 'all') load();
    } catch (err) {
      toast.error(err?.message || (typeof err === 'string' ? err : 'Could not update status'));
    }
  };

  const isLoading = adminStatus === STATUS.LOADING && adminReports.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={Flag}
        iconBg="#FEE2E2"
        iconColor="#DC2626"
        eyebrow="Admin / Reports"
        eyebrowColor="#DC2626"
        title="Reports & Moderation"
        description="Review user reports on messages and profiles. Mark them reviewed, resolved, or dismissed."
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={adminStatus === STATUS.LOADING}
            onClick={load}
          >
            Refresh
          </Button>
        }
      />

      <TabBar tabs={STATUS_TABS} activeId={statusTab} onChange={setStatusTab} />

      <Toolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: 'Search by reported user, reporter, email, message...',
        }}
        filters={[{
          id: 'reason',
          value: reasonFilter,
          onChange: setReasonFilter,
          options: REASON_FILTER_OPTIONS,
        }]}
      />

      <DataTable
        columns={REPORT_COLUMNS}
        rows={filtered}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Flag}
            title="No reports"
            message="Nothing matches the current filters. New reports will show up here."
          />
        }
        renderRow={(r) => {
          const reason = REASON_META[r.reason] || REASON_META.other;
          const st = STATUS_META[r.status] || STATUS_META.pending;
          return (
            <tr
              key={r.id}
              onClick={() => setDetailId(r.id)}
              className="border-t border-[#F0EBE3] hover:bg-[#FAFEE0] cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={personName(r.reportedUser)} src={personAvatar(r.reportedUser)} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3E3D38] truncate">{personName(r.reportedUser)}</p>
                    <p className="text-[11px] text-[#9A9A94] capitalize">{r.reportedUser?.role || '—'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${reason.cls}`}>
                  {reason.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-[#6B6B66] capitalize">{r.type}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-[#3E3D38]">{personName(r.reporter)}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-[#9A9A94]">{timeAgo(r.created_at)}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${st.cls}`}>
                  {st.label}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={(e) => { e.stopPropagation(); setDetailId(r.id); }}
                >
                  View
                </Button>
              </td>
            </tr>
          );
        }}
      />

      {detail && (
        <ReportDetailModal
          report={detail}
          busy={statusUpdating === STATUS.LOADING}
          onUpdateStatus={handleUpdateStatus}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

/* ── Detail modal ──────────────────────────────────────────── */
function ReportDetailModal({ report, busy, onUpdateStatus, onClose }) {
  const reason = REASON_META[report.reason] || REASON_META.other;
  const st = STATUS_META[report.status] || STATUS_META.pending;
  const ctx = Array.isArray(report.contextSnapshot) ? report.contextSnapshot : [];

  return (
    <Modal
      open
      size="lg"
      title={`Report #${report.id}`}
      subtitle={`${reason.label} · reported ${timeAgo(report.created_at)}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>
            {st.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {report.status !== 'reviewed' && (
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => onUpdateStatus(report.id, 'reviewed')}>
                Mark reviewed
              </Button>
            )}
            {report.status !== 'dismissed' && (
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => onUpdateStatus(report.id, 'dismissed')}>
                Dismiss
              </Button>
            )}
            {report.status !== 'resolved' && (
              <Button variant="primary" size="sm" loading={busy} onClick={() => onUpdateStatus(report.id, 'resolved')}>
                Resolve
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="max-h-[65vh] overflow-y-auto space-y-5 pr-1">
        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { tag: 'Reported user', u: report.reportedUser },
            { tag: 'Reported by',   u: report.reporter     },
          ].map(({ tag, u }) => (
            <div key={tag} className="rounded-xl border border-[#E5E0D8] p-3">
              <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">{tag}</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={personName(u)} src={personAvatar(u)} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#3E3D38] truncate">{personName(u)}</p>
                  <p className="text-[11px] text-[#9A9A94] truncate">{u?.email || '—'}</p>
                  <p className="text-[11px] text-[#9A9A94] capitalize">{u?.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reason + details */}
        <div>
          <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">Reason</p>
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${reason.cls}`}>
            {reason.label}
          </span>
          {report.details && (
            <p className="mt-2 text-sm text-[#3E3D38] whitespace-pre-wrap bg-[#FAFEE0] border border-[#E5E0D8] rounded-xl p-3">
              {report.details}
            </p>
          )}
        </div>

        {/* Reported message */}
        {report.reportedMessage && (
          <div>
            <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">Reported message</p>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-[#3E3D38] whitespace-pre-wrap">{report.reportedMessage.body}</p>
              <p className="mt-1 text-[10px] text-[#9A9A94]">{fmtFull(report.reportedMessage.createdAt)}</p>
            </div>
          </div>
        )}

        {/* Conversation context */}
        {ctx.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
              Conversation context · last {ctx.length} messages
            </p>
            <div className="space-y-2 rounded-xl border border-[#E5E0D8] p-3 bg-white">
              {ctx.map((m) => {
                const fromReported = m.senderId === report.reportedUserId;
                const isReported = report.messageId && m.id === report.messageId;
                return (
                  <div key={m.id} className={`flex ${fromReported ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm
                      ${isReported
                        ? 'bg-red-100 border border-red-300 text-[#3E3D38]'
                        : fromReported
                          ? 'bg-[#F4F0EA] text-[#3E3D38]'
                          : 'bg-[#F5FDA6]/40 border border-[#F5FDA6] text-[#3E3D38]'}`}
                    >
                      <p className="text-[10px] font-semibold text-[#9A9A94] mb-0.5">
                        {fromReported ? personName(report.reportedUser) : personName(report.reporter)}
                        {isReported && <span className="ml-1.5 text-red-600">· reported</span>}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="text-[10px] text-[#9A9A94] mt-0.5">{fmtFull(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}