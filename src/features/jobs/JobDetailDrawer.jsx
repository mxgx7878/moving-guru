import { Link } from 'react-router-dom';
import {
  Users, UserCheck, MapPin, Calendar, Clock, DollarSign, GraduationCap,
  ExternalLink, Mail, Ban, CheckCircle2, Trash2, Loader2,
} from 'lucide-react';
import {
  Drawer, Chip, StatusPill, StatTile, LabeledBlock, InfoRow, Avatar, Button, EmptyState,
} from '../../components/ui';
import {
  TYPE_STYLES, ROLE_TYPE_LABELS, QUALIFICATION_LABELS, JOB_STATUS_CONFIG,
} from '../../constants/jobConstants';
import { STATUS } from '../../constants/apiConstants';
import { resolveJobStatus } from './jobStatus';
import ApplicantRow from './ApplicantRow';

// Full-screen drawer for the admin job view. Lists applicants, shows
// type + status, and exposes activate/deactivate/delete actions.
export default function JobDetailDrawer({
  job,
  applicants = [],
  applicantsStatus = STATUS.IDLE,
  busy = false,
  onClose,
  onActivate,
  onDeactivate,
  onDelete,
}) {
  if (!job) {
    return (
      <Drawer
        open
        onClose={onClose}
        loading
        loadingSpinner={<Loader2 size={26} className="animate-spin text-[#E89560]" />}
      />
    );
  }

  const type     = TYPE_STYLES[job.type] || TYPE_STYLES.hire;
  const TypeIcon = type.icon;
  const status   = resolveJobStatus(job);
  const isActive = status !== 'inactive';
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;

  const header = (
    <div className="flex items-start gap-4 flex-1 min-w-0">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: type.color }}
      >
        <TypeIcon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: type.color }}
          >
            {type.label}
          </span>
          {job.role_type && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3E3D38] text-white">
              {ROLE_TYPE_LABELS[job.role_type] || job.role_type}
            </span>
          )}
          <StatusPill status={status} config={JOB_STATUS_CONFIG} size="xs" />
        </div>
        <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38]">
          {job.title}
        </h2>
        <p className="text-[11px] text-[#6B6B66] mt-0.5">
          Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
          {job.studio && (
            <> by <span className="font-semibold">
              {job.studio.studio_name || job.studio.name}
            </span></>
          )}
        </p>
      </div>
    </div>
  );

  const footer = (
    <>
      {isActive ? (
        <Button variant="secondary" size="sm" icon={Ban} onClick={onDeactivate} disabled={busy}
          className="hover:border-[#EF4444] hover:text-[#EF4444]">
          Deactivate
        </Button>
      ) : (
        <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={onActivate} disabled={busy}
          className="hover:border-emerald-500 hover:text-emerald-600">
          Activate
        </Button>
      )}
      <Button variant="outlineDanger" size="sm" icon={Trash2} onClick={() => onDelete?.(job)} disabled={busy}>
        Delete
      </Button>
    </>
  );

  return (
    <Drawer
      open
      onClose={onClose}
      size="xl"
      header={header}
      headerClassName=""
      /* The original drawer tinted the header with type.color; keep that look */
      footer={footer}
    >
      {/* Tint strip — keeps the drawer's type-colour association now that
          the Drawer shell uses a white header by default. */}
      <div
        className="-mx-6 -mt-6 mb-6 h-1"
        style={{ backgroundColor: type.color }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={Users}     label="Applicants" value={applicants.length || job.applicants_count || 0} />
        <StatTile icon={UserCheck} label="Filled"     value={`${filled} / ${vacancies}`} />
        <StatTile icon={MapPin}    label="Location"   value={job.location || '—'} />
        <StatTile icon={Calendar}  label="Start"      value={job.start_date || '—'} />
      </div>

      {job.description && (
        <LabeledBlock label="Description">
          <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </LabeledBlock>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <InfoRow icon={Clock}         label="Duration"      value={job.duration}     hideEmpty />
        <InfoRow icon={DollarSign}    label="Compensation"  value={job.compensation} hideEmpty />
        <InfoRow icon={GraduationCap} label="Qualification" value={QUALIFICATION_LABELS[job.qualification_level] || job.qualification_level} hideEmpty />
        <InfoRow icon={UserCheck}     label="Vacancies"     value={vacancies} />
      </div>

      {job.requirements && (
        <LabeledBlock label="Requirements">
          <p className="text-sm text-[#3E3D38] whitespace-pre-line leading-relaxed">
            {job.requirements}
          </p>
        </LabeledBlock>
      )}

      {(job.disciplines || []).length > 0 && (
        <LabeledBlock label="Disciplines">
          <div className="flex flex-wrap gap-1.5">
            {job.disciplines.map((d) => <Chip key={d} size="xs">{d}</Chip>)}
          </div>
        </LabeledBlock>
      )}

      {job.studio && (
        <div className="bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={job.studio.studio_name || job.studio.name}
              src={job.studio.detail?.profile_picture_url || job.studio.detail?.profile_picture || job.studio.profile_picture}
              tone="blue"
              shape="square"
              size="md"
            />
            <div className="min-w-0">
              <p className="font-['Unbounded'] text-xs font-black text-[#3E3D38] truncate">
                {job.studio.studio_name || job.studio.name}
              </p>
              {job.studio.email && (
                <p className="text-[10px] text-[#9A9A94] flex items-center gap-1 truncate">
                  <Mail size={9} /> {job.studio.email}
                </p>
              )}
            </div>
          </div>
          <Link
            to="/admin/users?role=studio"
            className="text-[11px] font-bold text-[#2DA4D6] hover:underline flex items-center gap-1 flex-shrink-0"
          >
            View in users <ExternalLink size={10} />
          </Link>
        </div>
      )}

      <LabeledBlock label={`Applicants (${applicants.length})`}>
        {applicantsStatus === STATUS.LOADING ? (
          <div className="py-6 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-[#E89560]" />
          </div>
        ) : applicants.length === 0 ? (
          <p className="text-xs text-[#9A9A94] py-3">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {applicants.map((app) => <ApplicantRow key={app.id} app={app} />)}
          </div>
        )}
      </LabeledBlock>
    </Drawer>
  );
}
