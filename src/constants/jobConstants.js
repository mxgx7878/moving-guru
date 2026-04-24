import { Briefcase, RefreshCw, Zap, CheckCircle2, Ban, Lock } from 'lucide-react';

export const ROLE_TYPE_OPTIONS = [
  { id: 'permanent',     label: 'Permanent'                  },
  { id: 'temporary',     label: 'Temporary'                  },
  { id: 'substitute',    label: 'Substitute'                 },
  { id: 'weekend_cover', label: 'Substitute for the weekend' },
  { id: 'casual',        label: 'Casual / On-call'           },
];

export const ROLE_TYPE_LABELS = ROLE_TYPE_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.id]: o.label }),
  {},
);

export const QUALIFICATION_LEVELS = [
  { id: 'none',               label: 'Not required'                      },
  { id: 'intermediate',       label: 'Intermediate / High School'        },
  { id: 'diploma',            label: 'Diploma / Associate'               },
  { id: 'bachelors',          label: "Bachelor's Degree"                 },
  { id: 'masters',            label: "Master's Degree"                   },
  { id: 'doctorate',          label: 'Doctorate / PhD'                   },
  { id: 'cert_200hr',         label: '200hr Teacher Certification'       },
  { id: 'cert_500hr',         label: '500hr Teacher Certification'       },
  { id: 'cert_comprehensive', label: 'Comprehensive Certification'       },
  { id: 'cert_specialized',   label: 'Specialised / Other Certification' },
];

export const QUALIFICATION_LABELS = QUALIFICATION_LEVELS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q.label }),
  {},
);

export const DURATION_OPTIONS = [
  '1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', 'Ongoing',
];

// Listing types used in the studio create form (no "All" option).
// Energy exchange is no longer a standalone job type — it's a separate
// opt-in flag on the listing. Studios can now select one OR both of
// these so a single post covers "hire or swap" scenarios.
export const JOB_TYPES = [
  { id: 'hire', label: 'Direct Hire',     icon: Briefcase, color: '#2DA4D6', bg: 'bg-[#2DA4D6]/10' },
  { id: 'swap', label: 'Instructor Swap', icon: RefreshCw, color: '#E89560', bg: 'bg-[#E89560]/10' },
];

// Filter tabs shown on the instructor Find Work page (includes "All")
export const JOB_FILTER_TABS = [
  { id: 'all',  label: 'All Listings',    color: '#CCFF00', bg: 'bg-[#CCFF00]', activeText: '#3E3D38' },
  { id: 'hire', label: 'Direct Hire',     color: '#2DA4D6', bg: 'bg-[#2DA4D6]', activeText: '#FFFFFF' },
  { id: 'swap', label: 'Instructor Swap', color: '#E89560', bg: 'bg-[#E89560]', activeText: '#FFFFFF' },
];

// Display styling for job cards on the instructor Find Work feed
export const TYPE_STYLES = {
  hire:            { icon: Briefcase, color: '#2DA4D6', bg: 'bg-[#2DA4D6]/10', text: 'text-[#2DA4D6]', label: 'Direct Hire'     },
  swap:            { icon: RefreshCw, color: '#E89560', bg: 'bg-[#E89560]/15', text: 'text-[#E89560]', label: 'Instructor Swap' },
  energy_exchange: { icon: Zap,       color: '#6BE6A4', bg: 'bg-[#6BE6A4]/20', text: 'text-[#3E3D38]', label: 'Energy Exchange' },
};

// Status vocabulary shown on the admin job table and drawer. Jobs don't
// have a single `status` field — `resolveJobStatus` (in features/jobs)
// normalises `is_active` + `positions_filled/vacancies` into one of
// these keys. Shape matches the StatusPill `config` prop.
export const JOB_STATUS_CONFIG = {
  active:   { label: 'Active',        icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'     },
  inactive: { label: 'Deactivated',   icon: Ban,          cls: 'bg-red-50 text-red-700 border-red-200'           },
  full:     { label: 'Closed / Full', icon: Lock,         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export const EMPTY_JOB_FORM = {
  title:               '',
  type:                'hire',
  types:               ['hire'],
  open_to_energy_exchange: false,
  role_type:           'permanent',
  description:         '',
  disciplines:         [],
  location:            '',
  start_date:          '',
  duration:            '',
  compensation:        '',
  requirements:        '',
  qualification_level: 'none',
  is_active:           true,
  vacancies:           1,
};