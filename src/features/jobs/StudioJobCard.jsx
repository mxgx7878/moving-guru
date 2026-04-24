import {
  MapPin, Calendar, Clock, Eye, EyeOff, Edit3, Trash2, Users, UserCheck, Lock,
} from 'lucide-react';
import { Button, Chip, IconButton } from '../../components/ui';
import { ButtonLoader } from '../../components/feedback';
import { JOB_TYPES } from '../../constants/jobConstants';

// Studio-facing job card used on JobListings (a studio managing its own
// postings). Distinct from the admin JobRow which renders inside a
// table — this version is a stand-alone card for the studio dashboard.
export default function StudioJobCard({
  job,
  deleting = false,
  onEdit,
  onDelete,
  onToggleActive,
  onViewApplicants,
}) {
  const typeInfo = JOB_TYPES.find((t) => t.id === job.type) || JOB_TYPES[0];
  const TypeIcon = typeInfo.icon;
  const applicantCount = job.applicants_count || 0;
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  const isFull    = filled >= vacancies;
  const isActive  = job.is_active !== false;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all
      ${isActive ? 'border-[#E5E0D8]' : 'border-[#E5E0D8] opacity-80'}`}
    >
      {isFull && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2 flex items-center gap-2 text-xs text-emerald-700">
          <Lock size={12} />
          <span className="font-semibold">
            Closed — all {vacancies} vacancy{vacancies !== 1 ? 'ies' : ''} filled.
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: typeInfo.color }}
              >
                <TypeIcon size={10} /> {typeInfo.label}
              </span>
              {!isActive && !isFull && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF8E4] text-[#9A9A94]">
                  Inactive
                </span>
              )}
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${isFull ? 'bg-emerald-50 text-emerald-600' : 'bg-[#2DA4D6]/10 text-[#2DA4D6]'}`}
              >
                <UserCheck size={10} /> {filled} of {vacancies} filled
              </span>
            </div>

            <h3 className="font-unbounded text-base font-black text-[#3E3D38] mb-1 truncate">
              {job.title}
            </h3>
            <p className="text-[#6B6B66] text-sm line-clamp-2">{job.description}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isFull && (
              <IconButton
                variant="plain"
                size="md"
                tone="default"
                onClick={onToggleActive}
                title={isActive ? 'Set inactive' : 'Set active'}
              >
                {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </IconButton>
            )}
            <IconButton variant="plain" size="md" tone="default" onClick={onEdit} title="Edit">
              <Edit3 size={14} />
            </IconButton>
            <IconButton
              variant="plain"
              size="md"
              tone="red"
              onClick={onDelete}
              disabled={deleting}
              title="Delete"
            >
              {deleting ? <ButtonLoader size={14} color="#CE4F56" /> : <Trash2 size={14} />}
            </IconButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <MapPin size={12} className="text-[#9A9A94]" /> {job.location}
            </div>
          )}
          {job.start_date && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Calendar size={12} className="text-[#9A9A94]" /> {job.start_date}
            </div>
          )}
          {job.duration && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66]">
              <Clock size={12} className="text-[#9A9A94]" /> {job.duration}
            </div>
          )}
          {job.compensation && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B6B66] font-semibold">
              💰 {job.compensation}
            </div>
          )}
        </div>

        {(job.disciplines || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.disciplines.map((d) => (
              <Chip key={d} size="xs" tone="blue">{d}</Chip>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E5E0D8]">
          <div className="flex items-center gap-1.5 text-xs text-[#9A9A94]">
            <Users size={12} />
            {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
          </div>
          <Button
            variant={applicantCount === 0 ? 'secondary' : 'primary'}
            size="sm"
            icon={Users}
            disabled={applicantCount === 0}
            onClick={onViewApplicants}
          >
            View Applicants
          </Button>
        </div>
      </div>
    </div>
  );
}
