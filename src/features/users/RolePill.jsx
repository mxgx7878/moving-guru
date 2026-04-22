import { Users, Building2, ShieldCheck } from 'lucide-react';
import { Chip } from '../../components/ui';

const ROLE_CONFIG = {
  instructor: { icon: Users,       tone: 'coral',  label: 'Instructor' },
  studio:     { icon: Building2,   tone: 'blue',   label: 'Studio'     },
  admin:      { icon: ShieldCheck, tone: 'purple', label: 'Admin'      },
};

// Role badge used in user rows / drawers. Small wrapper over Chip so the
// role-specific icon + colour is configured in one place.
export default function RolePill({ role, size = 'sm', className = '' }) {
  const cfg = ROLE_CONFIG[role] || { icon: Users, tone: 'neutral', label: role || '—' };
  return (
    <Chip icon={cfg.icon} tone={cfg.tone} size={size} className={className}>
      {cfg.label}
    </Chip>
  );
}
