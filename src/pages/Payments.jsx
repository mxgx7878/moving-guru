import { useAuth } from '../contexts/AuthContext';
import { DUMMY_PAYMENTS } from '../data/dummyData';
import { Download, CreditCard, CheckCircle, Calendar, DollarSign } from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const payments = DUMMY_PAYMENTS;
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-black">Payment History</h1>
        <p className="text-black/40 text-sm mt-1">Your billing history and invoices</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-black/6 text-center">
          <DollarSign size={16} className="text-black/30 mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-black">${total}</p>
          <p className="text-[10px] text-black/40 uppercase tracking-wider mt-1">Total Paid</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/6 text-center">
          <CreditCard size={16} className="text-black/30 mx-auto mb-2" />
          <p className="font-['Unbounded'] text-xl font-black text-black">{payments.length}</p>
          <p className="text-[10px] text-black/40 uppercase tracking-wider mt-1">Payments</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-black/6 text-center">
          <Calendar size={16} className="text-black/30 mx-auto mb-2" />
          <p className="font-['Unbounded'] text-sm font-black text-black">{user?.subscriptionRenews || '—'}</p>
          <p className="text-[10px] text-black/40 uppercase tracking-wider mt-1">Next Renewal</p>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl p-5 border border-black/6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Visa •••• 4242</p>
              <p className="text-xs text-black/40">Expires 12/28</p>
            </div>
          </div>
          <button className="text-xs text-black/40 border border-black/15 px-3 py-1.5 rounded-lg hover:border-black/30 transition-colors">
            Update
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
        <div className="px-6 py-4 border-b border-black/6">
          <h3 className="font-['Unbounded'] text-xs font-bold text-black tracking-wider uppercase">Transactions</h3>
        </div>

        <div className="divide-y divide-black/5">
          {payments.map(p => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-black/2 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{p.plan} Subscription</p>
                  <p className="text-xs text-black/40">{p.date} · {p.invoice}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-['Unbounded'] text-sm font-bold text-black">${p.amount}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-black/30 hover:text-black/60">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="px-6 py-12 text-center">
            <CreditCard size={32} className="text-black/15 mx-auto mb-3" />
            <p className="text-black/30 text-sm">No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
