import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Universal dashboard stat card. Superset of every inline "stat card"
// pattern that dashboard pages used to redeclare. Supports:
//
//   - `icon`    — lucide component
//   - `color`   — raw hex (e.g. "#2DA4D6") OR one of the named enums
//                 ('blue' | 'coral' | 'green' | 'purple' | 'orange')
//   - `delta`   — signed percentage; positive shows emerald "+N%", negative
//                 shows red "-N%" with a rotated arrow
//   - `to`      — optional route; when present, the card renders as a
//                 <Link> with a hover hint arrow
//   - `label` / `value` / `sub` — the three text rows
//
// Intentionally distinct from:
//   StatCard       — basic card with icon + coral/orange/default enum
//   StatTile       — tiny drawer tile with cream background
//   StatTileGroup  — strip of value-first KPIs (no icon)
const ENUM_COLORS = {
  blue:   '#2DA4D6',
  coral:  '#CE4F56',
  green:  '#6BE6A4',
  purple: '#7F77DD',
  orange: '#E89560',
};

export default function DashboardStatCard({
  icon: Icon,
  color = '#3E3D38',
  label,
  value,
  sub,
  delta,
  to,
  className = '',
}) {
  const hex = ENUM_COLORS[color] || color;
  const display = value ?? '—';

  const body = (
    <>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${hex}15` }}
          >
            <Icon size={18} style={{ color: hex }} />
          </div>
        )}
        {typeof delta === 'number' && delta !== 0 && (
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${delta > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}
          >
            <TrendingUp size={9} className={delta < 0 ? 'rotate-180' : ''} />
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <p className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-1">{display}</p>
      <p className="text-xs font-semibold text-[#6B6B66]">{label}</p>
      {sub && <p className="text-[10px] text-[#9A9A94] mt-0.5">{sub}</p>}
      {to && (
        <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#9A9A94] group-hover:text-[#3E3D38]">
          Open <ArrowRight size={10} />
        </span>
      )}
    </>
  );

  const baseCls = `bg-white rounded-2xl border border-[#E5E0D8] p-5 transition-all ${className}`;

  if (to) {
    return (
      <Link to={to} className={`group ${baseCls} hover:shadow-md hover:border-[#3E3D38]/20`}>
        {body}
      </Link>
    );
  }

  return <div className={baseCls}>{body}</div>;
}
