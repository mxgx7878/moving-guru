import {
  Building2, MapPin, Users, Eye, Ban, CheckCircle2, Trash2,
} from 'lucide-react';
import { StatusPill, IconButton } from '../../components/ui';
import { TYPE_STYLES, ROLE_TYPE_LABELS, JOB_STATUS_CONFIG, getJobTypes, isOpenToEnergyExchange, getDisplayableJobTypes, } from '../../constants/jobConstants';
import { resolveJobStatus } from './jobStatus';

// One row in the admin job listings table. All mutation callbacks are
// optional — the parent decides which actions are live for the row.
export default function JobRow({ job, busy = false, onPreview, onActivate, onDeactivate, onDelete }) {
 const typesIds    = getDisplayableJobTypes(job);
  const typesInfo   = typesIds.map((id) => TYPE_STYLES[id]).filter(Boolean);
  const primary     = typesInfo[0] || TYPE_STYLES.hire;
  const PrimaryIcon = primary.icon;
  const eeOpen      = isOpenToEnergyExchange(job);
  const status    = resolveJobStatus(job);
  const isActive  = status === 'active' || status === 'full';
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  const applicants = job.applicants_count || 0;
  const studioName = job.studio?.studio_name || job.studio?.name || 'Unknown';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: primary.color + '15' }}
          >
            <PrimaryIcon size={14} style={{ color: primary.color }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#3E3D38] text-xs line-clamp-1">{job.title } {eeOpen && <span className="text-[9px] text-[#9A9A94] mt-0.5">+ Energy exchange</span>}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {typesInfo.map((info) => (
                <span
                  key={info.label}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: info.color }}
                >
                  {info.label}
                </span>
              ))}
              {job.role_type && (
                <span className="text-[10px] text-[#9A9A94]">
                  · {ROLE_TYPE_LABELS[job.role_type] || job.role_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-xs text-[#3E3D38]">
          <Building2 size={11} className="text-[#9A9A94]" />
          <span className="truncate max-w-[140px]">{studioName}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        {job.location ? (
          <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
            <MapPin size={11} /> {job.location}
          </span>
        ) : <span className="text-xs text-[#C4BCB4]">—</span>}
      </td>

      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-xs text-[#6B6B66]">
          <Users size={11} className="text-[#9A9A94]" />
          {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
        </span>
        <span className="text-[10px] text-[#9A9A94]">{filled}/{vacancies} filled</span>
      </td>

      <td className="py-3 px-4">
        <StatusPill status={status} config={JOB_STATUS_CONFIG} size="xs" />
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1.5">
          <IconButton title="View details" onClick={onPreview}>
            <Eye size={13} />
          </IconButton>

          {isActive ? (
            <IconButton title="Deactivate" onClick={onDeactivate} tone="red" disabled={busy}>
              <Ban size={13} />
            </IconButton>
          ) : (
            <IconButton title="Activate" onClick={onActivate} tone="green" disabled={busy}>
              <CheckCircle2 size={13} />
            </IconButton>
          )}

          <IconButton title="Delete" onClick={onDelete} tone="red" disabled={busy}>
            <Trash2 size={13} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
