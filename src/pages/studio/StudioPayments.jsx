import { Download, CheckCircle } from 'lucide-react';

const PAYMENTS = [
  { id: 'pay_008', date: '2026-03-12', amount: 2, plan: 'Monthly (Launch Promo)', status: 'Paid', invoice: '#INV-008' },
  { id: 'pay_007', date: '2026-02-12', amount: 2, plan: 'Monthly (Launch Promo)', status: 'Paid', invoice: '#INV-007' },
  { id: 'pay_006', date: '2026-01-12', amount: 2, plan: 'Monthly (Launch Promo)', status: 'Paid', invoice: '#INV-006' },
];

export default function StudioPayments() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Payment History</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Your billing records and invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: '$6.00', sub: 'Since joining' },
          { label: 'Current Plan', value: '$2/mo', sub: 'Launch promo' },
          { label: 'Next Payment', value: 'Apr 12', sub: '2026' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E0D8] p-5 text-center">
            <p className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">{s.value}</p>
            <p className="text-[#3E3D38] text-xs font-semibold mt-1">{s.label}</p>
            <p className="text-[#9A9A94] text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8]">
          <h3 className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">Transactions</h3>
        </div>
        <div className="divide-y divide-[#E5E0D8]">
          {PAYMENTS.map(p => (
            <div key={p.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-[#6BE6A4]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-[#3E3D38]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#3E3D38] text-sm font-semibold">{p.plan}</p>
                <p className="text-[#9A9A94] text-xs">{p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-['Unbounded'] text-sm font-black text-[#3E3D38]">${p.amount.toFixed(2)}</p>
                <span className="text-[10px] text-[#6BE6A4] font-semibold">{p.status}</span>
              </div>
              <button className="text-[#9A9A94] hover:text-[#2DA4D6] transition-colors ml-2">
                <Download size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[#9A9A94] text-xs">
        Need a receipt or have billing questions? Contact{' '}
        <a href="mailto:admin@movingguru.co" className="text-[#2DA4D6] hover:underline">admin@movingguru.co</a>
      </p>
    </div>
  );
}