import { CheckCircle2, Ban, Lock } from 'lucide-react';

// Derives a single status key from a job's flags so one StatusPill
// config can cover every case. Jobs don't have a single `status` field —
// instead `is_active` toggles suspension and `positions_filled` vs
// `vacancies` decides "Closed / Full".
export const resolveJobStatus = (job) => {
  if (!job) return 'unknown';
  if (job.is_active === false) return 'inactive';
  const vacancies = job.vacancies || 1;
  const filled    = job.positions_filled || 0;
  if (filled >= vacancies) return 'full';
  return 'active';
};

export const JOB_STATUS_CONFIG = {
  active:   { label: 'Active',       icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'     },
  inactive: { label: 'Deactivated',  icon: Ban,          cls: 'bg-red-50 text-red-700 border-red-200'           },
  full:     { label: 'Closed / Full', icon: Lock,        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};
