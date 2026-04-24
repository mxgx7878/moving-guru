import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Download, CreditCard, CheckCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { fetchPayments } from '../../store/actions/paymentAction';
import { STATUS } from '../../constants/apiConstants';
import { TableSkeleton, CardSkeleton } from '../../components/feedback';
import { Button } from '../../components/ui';

/**
 * Payments page — shared between instructor and studio portals.
 *
 * Studio-specific addition: a "Total Spend" card that sums all
 * successful payments (subscription + any one-off charges like
 * featured listings). Falls back to the same total for instructors
 * but uses role-aware copy so "Total Paid" stays accurate for them.
 */
export default function Payments() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { payments, status } = useSelector((s) => s.payment);
  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;
  const isStudio = role === 'studio';

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  // Only count paid/successful payments toward the totals — refunded /
  // failed rows shouldn't pad the spend.
  const paidOnly = payments.filter(
    (p) => !p.status || ['paid', 'Paid', 'succeeded', 'completed'].includes(p.status),
  );
  const total = paidOnly.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // Running avg per month (for studios who like the signal)
  const months = new Set(
    paidOnly.map((p) => (p.date || '').slice(0, 7)).filter(Boolean),
  );
  const avgPerMonth = months.size > 0 ? total / months.size : 0;

  if (status === STATUS.LOADING && payments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Payment History</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Your billing history and invoices</p>
        </div>
        <CardSkeleton count={3} />
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Payment History</h1>
        <p className="text-[#9A9A94] text-sm mt-1">
          {isStudio ? 'Track what your studio has spent on Moving Guru' : 'Your billing history and invoices'}
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────────── */}
      {isStudio ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Studio Total Spend — highlighted hero card */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#2DA4D6] to-[#2590bd] rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <TrendingUp size={14} className="opacity-80" />
            </div>
            <p className="font-unbounded text-3xl font-black leading-none">
              ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-white/80 text-xs font-semibold mt-2 uppercase tracking-wider">Total Spend</p>
            <p className="text-white/60 text-[10px] mt-1">All-time across your studio account</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
            <div className="w-10 h-10 rounded-xl bg-[#E89560]/10 flex items-center justify-center mb-3">
              <CreditCard size={16} className="text-[#E89560]" />
            </div>
            <p className="font-unbounded text-2xl font-black text-[#3E3D38]">{paidOnly.length}</p>
            <p className="text-[#9A9A94] text-xs font-semibold mt-1">Payments Made</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
            <div className="w-10 h-10 rounded-xl bg-[#6BE6A4]/20 flex items-center justify-center mb-3">
              <Calendar size={16} className="text-[#3E3D38]" />
            </div>
            <p className="font-unbounded text-lg font-black text-[#3E3D38]">
              ${avgPerMonth.toFixed(2)}
            </p>
            <p className="text-[#9A9A94] text-xs font-semibold mt-1">Avg / Month</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
            <DollarSign size={16} style={{ color: theme.accent }} className="mx-auto mb-2" />
            <p className="font-unbounded text-xl font-black text-[#3E3D38]">${total.toFixed(2)}</p>
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Total Paid</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
            <CreditCard size={16} className="text-[#E89560] mx-auto mb-2" />
            <p className="font-unbounded text-xl font-black text-[#3E3D38]">{paidOnly.length}</p>
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Payments</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
            <Calendar size={16} className="text-[#2DA4D6] mx-auto mb-2" />
            <p className="font-unbounded text-sm font-black text-[#3E3D38]">
              {user?.subscriptionRenews || user?.subscription_renews || '—'}
            </p>
            <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Next Renewal</p>
          </div>
        </div>
      )}

      {/* ── Payment method ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
              <CreditCard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3E3D38]">Visa •••• 4242</p>
              <p className="text-xs text-[#9A9A94]">Expires 12/28</p>
            </div>
          </div>
          <Button variant="secondary" size="xs" className="hover:border-sky-mg hover:text-sky-mg">
            Update
          </Button>
        </div>
      </div>

      {/* ── Transactions ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8]">
          <h3 className="font-unbounded text-xs font-bold text-[#3E3D38] tracking-wider uppercase">
            Transactions
          </h3>
        </div>

        <div className="divide-y divide-[#E5E0D8]/50">
          {payments.map((p) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#FDFCF8] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3E3D38]">{p.plan} Subscription</p>
                  <p className="text-xs text-[#9A9A94]">{p.date} · {p.invoice}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-unbounded text-sm font-bold text-[#3E3D38]">
                    ${Number(p.amount || 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94] hover:text-[#3E3D38]">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="px-6 py-12 text-center">
            <CreditCard size={32} className="text-[#E5E0D8] mx-auto mb-3" />
            <p className="text-[#9A9A94] text-sm">No payments yet</p>
          </div>
        )}
      </div>

      <p className="text-center text-[#9A9A94] text-xs">
        Need a receipt or have billing questions? Contact{' '}
        <a href="mailto:admin@movingguru.co" className="text-[#2DA4D6] hover:underline">admin@movingguru.co</a>
      </p>
    </div>
  );
}