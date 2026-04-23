import { Calendar } from 'lucide-react';
import { formatShortDate } from '../../utils/formatters';

// Row used in the admin subscriptions table. One row per subscription
// record; pulls user/plan through relations but tolerates flat fields
// too (the API occasionally returns denormalised shapes).
const STATUS_CLS = {
  active:    'bg-green-50 text-green-700',
  trialing:  'bg-yellow-50 text-yellow-700',
  past_due:  'bg-orange-50 text-orange-700',
  cancelled: 'bg-red-50 text-red-700',
  canceled:  'bg-red-50 text-red-700',
};

export default function SubscriptionRow({ sub }) {
  const user = sub.user || {};
  const plan = sub.plan || {};
  const price = plan.price_monthly || sub.plan_price || 0;
  const statusCls = STATUS_CLS[sub.status] || 'bg-gray-50 text-gray-600';

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FDFCF8]">
      <td className="py-3 px-4">
        <p className="font-semibold text-[#3E3D38] text-xs">{user.name || user.studio_name || '—'}</p>
        <p className="text-[10px] text-[#9A9A94]">{user.email || '—'}</p>
      </td>
      <td className="py-3 px-4 text-xs text-[#3E3D38]">
        {plan.name || sub.plan_name || '—'}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls} capitalize`}>
          {sub.status?.replace('_', ' ') || '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-[#6B6B66]">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatShortDate(sub.current_period_end) || '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-right text-xs font-semibold text-[#3E3D38]">
        {price ? `$${price}` : '—'}
      </td>
    </tr>
  );
}
