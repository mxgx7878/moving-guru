// src/features/subscriptions/SubscriptionRow.jsx
//
// CHANGE: Trialing status now displays the trial-end date inline as
// a secondary timestamp, and the next-renewal column shows "Trial
// ends" instead of "Renews" while in trial. Both make it obvious at
// a glance which subscriptions are mid-trial.

import { Calendar, Gift } from 'lucide-react';
import { formatShortDate } from '../../utils/formatters';

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
  const price = plan.price_monthly || sub.plan_price || plan.price || 0;
  const statusCls = STATUS_CLS[sub.status] || 'bg-gray-50 text-gray-600';
  const isTrialing = sub.status === 'trialing';

  // For trialing subs, the meaningful "next date" is the trial end —
  // that's when the user will actually be charged. For everyone else
  // it's the period end (next renewal or cancellation date).
  const dateLabel = isTrialing ? 'Trial ends' : 'Renews';
  const dateValue = isTrialing
    ? (sub.trialEndsAt || sub.trial_ends_at || sub.current_period_end)
    : (sub.currentPeriodEnd || sub.current_period_end);

  return (
    <tr className="border-t border-[#F0EBE3] hover:bg-[#FFFFFF]">
      <td className="py-3 px-4">
        <p className="font-semibold text-[#3E3D38] text-xs">{user.name || user.studio_name || '—'}</p>
        <p className="text-[10px] text-[#9A9A94]">{user.email || '—'}</p>
      </td>
      <td className="py-3 px-4 text-xs text-[#3E3D38]">
        {plan.name || sub.plan_name || '—'}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls} capitalize`}>
          {isTrialing && <Gift size={9} />}
          {sub.status?.replace('_', ' ') || '—'}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-[#6B6B66]">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          <span>
            {formatShortDate(dateValue) || '—'}
            <span className="text-[10px] text-[#9A9A94] ml-1">({dateLabel.toLowerCase()})</span>
          </span>
        </span>
      </td>
      <td className="py-3 px-4 text-right text-xs font-semibold text-[#3E3D38]">
        {price ? `$${price}` : '—'}
      </td>
    </tr>
  );
}