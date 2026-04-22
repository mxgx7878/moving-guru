import { AlertCircle } from 'lucide-react';

// Generic status pill driven by a config map:
//   <StatusPill status="active" config={USER_STATUS} />
// The config entry shape is { label, icon, cls } where `cls` is the
// Tailwind background/text/border classes. If the status isn't in the
// config an "Unknown" fallback is used. Keeps every page's pill rendering
// identical while still letting each domain own its own status vocabulary.
export default function StatusPill({ status, config, size = 'sm', className = '' }) {
  const cfg = (config && config[status]) || {
    label: status || 'Unknown',
    icon: AlertCircle,
    cls: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const Icon = cfg.icon;
  const sizeCls = size === 'xs'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-[11px] px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${sizeCls} ${cfg.cls} ${className}`}>
      {Icon && <Icon size={10} />} {cfg.label}
    </span>
  );
}
