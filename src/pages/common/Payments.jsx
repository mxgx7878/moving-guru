import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Download, CreditCard, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { fetchPayments } from '../../store/actions/paymentAction';
import { STATUS } from '../../constants/apiConstants';
import { TableSkeleton, CardSkeleton } from '../../components/feedback';

export default function Payments() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { payments, status } = useSelector((s) => s.payment);
  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);

  if (status === STATUS.LOADING && payments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Payment History</h1>
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
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Payment History</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Your billing history and invoices</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <DollarSign size={16} style={{ color: theme.accent }} className="mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">${total.toFixed(2)}</p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Total Paid</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <CreditCard size={16} className="text-[#E89560] mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{payments.length}</p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Payments</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <Calendar size={16} className="text-[#2DA4D6] mx-auto mb-2" />
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">
            {user?.subscriptionRenews || user?.subscription_renews || '—'}
          </p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Next Renewal</p>
        </div>
      </div>

      {/* Payment method */}
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
          <button
            className="text-xs text-[#6B6B66] border border-[#E5E0D8] px-3 py-1.5 rounded-lg hover:text-[#2DA4D6] hover:border-[#2DA4D6] transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8]">
          <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">Transactions</h3>
        </div>

        <div className="divide-y divide-[#E5E0D8]/50">
          {payments.map(p => (
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
                  <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">${p.amount?.toFixed(2)}</p>
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
