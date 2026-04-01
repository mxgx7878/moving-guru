import { useSelector } from 'react-redux';
import { DUMMY_PAYMENTS } from '../data/dummyData';
import { Download, CreditCard, CheckCircle, Calendar, DollarSign } from 'lucide-react';

export default function Payments() {
  const { user } = useSelector((state) => state.auth);
  const payments = DUMMY_PAYMENTS;
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Payment History</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Your billing history and invoices</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <DollarSign size={16} className="text-[#CE4F56] mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">${total}</p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Total Paid</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <CreditCard size={16} className="text-[#E89560] mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{payments.length}</p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Payments</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] text-center">
          <Calendar size={16} className="text-[#2DA4D6] mx-auto mb-2" />
          <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">{user?.subscriptionRenews || '—'}</p>
          <p className="text-[10px] text-[#9A9A94] uppercase tracking-wider mt-1">Next Renewal</p>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CE4F56] rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3E3D38]">Visa •••• 4242</p>
              <p className="text-xs text-[#9A9A94]">Expires 12/28</p>
            </div>
          </div>
          <button className="text-xs text-[#6B6B66] border border-[#E5E0D8] px-3 py-1.5 rounded-lg hover:border-[#2DA4D6] hover:text-[#2DA4D6] transition-colors">
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
                  <p className="font-['Unbounded'] text-sm font-bold text-[#3E3D38]">${p.amount}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-[#EDE8DF] rounded-lg transition-colors text-[#9A9A94] hover:text-[#3E3D38]">
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
    </div>
  );
}
