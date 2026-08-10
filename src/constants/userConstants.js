import { CheckCircle2, Ban, Sparkles, XCircle } from 'lucide-react';

export const USER_STATUS_CONFIG = {
  active:    { label: 'Active',    icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200'    },
  suspended: { label: 'Suspended', icon: Ban,          cls: 'bg-red-50 text-red-700 border-red-200'          },
  pending:   { label: 'Pending',   icon: Sparkles,     cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected:  { label: 'Rejected',  icon: XCircle,      cls: 'bg-red-50 text-red-700 border-red-200'          },
};
