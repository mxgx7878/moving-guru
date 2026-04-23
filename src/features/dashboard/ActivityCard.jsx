import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

// Activity feed card used on admin (and soon portal) dashboards.
// Renders a header (icon + title + "view all" link) and a list of up to
// 5 items via a render-prop. Handles loading / empty states too.
export default function ActivityCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  to,
  items,
  loading,
  empty,
  renderItem,
  limit = 5,
}) {
  const hasItems = items && items.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accent}15` }}
            >
              <Icon size={15} style={{ color: accent }} />
            </div>
          )}
          <div>
            <p className="font-['Unbounded'] text-xs font-bold text-[#3E3D38]">{title}</p>
            <p className="text-[10px] text-[#9A9A94]">{subtitle}</p>
          </div>
        </div>
        {to && (
          <Link
            to={to}
            className="text-[10px] font-semibold text-[#9A9A94] hover:text-[#3E3D38] flex items-center gap-1"
          >
            View all <ArrowRight size={10} />
          </Link>
        )}
      </div>

      <div className="divide-y divide-[#F0EBE3]">
        {loading && !hasItems ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#9A9A94]" />
          </div>
        ) : !hasItems ? (
          <div className="py-10 text-center">
            <CheckCircle2 size={20} className="mx-auto text-[#C4BCB4] mb-1.5" />
            <p className="text-[11px] text-[#9A9A94]">{empty}</p>
          </div>
        ) : (
          items.slice(0, limit).map((item, i) => (
            <div key={item.id || i} className="px-5 py-3 hover:bg-[#FDFCF8]">
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
