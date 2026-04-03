import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Check, Star, Zap } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly', label: 'Monthly', price: 15, per: '/mo',
    features: ['Full instructor directory access', 'Unlimited messaging', 'Save favourite instructors', 'Studio profile listing'],
    highlight: false,
  },
  {
    id: 'biannual', label: '6 Months', price: 45, per: '/6mo', perMonth: '~$7.50/mo',
    features: ['Full instructor directory access', 'Unlimited messaging', 'Save favourite instructors', 'Studio profile listing', 'Priority in instructor search'],
    highlight: true,
  },
  {
    id: 'annual', label: '12 Months', price: 60, per: '/yr', perMonth: '~$5/mo',
    features: ['Full instructor directory access', 'Unlimited messaging', 'Save favourite instructors', 'Studio profile listing', 'Priority in instructor search', 'Featured studio badge'],
    highlight: false,
  },
];

export default function StudioSubscription() {
  const { user } = useSelector(s => s.auth);
  const currentPlan = user?.subscription || 'monthly';
  const [selected, setSelected] = useState(currentPlan);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Subscription</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Manage your Moving Guru studio membership</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-[#2DA4D6]/8 border border-[#2DA4D6]/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#2DA4D6]/15 rounded-xl flex items-center justify-center">
          <Star size={18} className="text-[#2DA4D6]" />
        </div>
        <div className="flex-1">
          <p className="text-[#3E3D38] text-sm font-semibold">Current Plan: <span className="text-[#2DA4D6]">Monthly — $15/mo</span></p>
          <p className="text-[#9A9A94] text-xs mt-0.5">Renews April 12, 2026</p>
        </div>
        <span className="px-3 py-1.5 bg-[#2DA4D6] text-white text-xs font-bold rounded-full">Active</span>
      </div>

      {/* Launch promo */}
      <div className="bg-[#f5fca6]/40 border border-[#f5fca6] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Zap size={16} className="text-[#3E3D38] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#3E3D38] text-sm font-bold">🎉 Launch Promo — Active</p>
            <p className="text-[#6B6B66] text-xs mt-1 leading-relaxed">
              First 3 months for $2 — founding member pricing locked in for your account. First 100 studios internationally get 6 months free to build the network.
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {PLANS.map(plan => (
          <div key={plan.id} onClick={() => setSelected(plan.id)}
            className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all relative
              ${selected === plan.id ? 'border-[#2DA4D6]' : 'border-[#E5E0D8] hover:border-[#2DA4D6]/40'}`}>
            {plan.highlight && (
              <span className="absolute top-4 right-4 bg-[#f5fca6] text-[#3E3D38] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all
                ${selected === plan.id ? 'border-[#2DA4D6]' : 'border-[#C4BCB4]'}`}>
                {selected === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2DA4D6]" />}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">${plan.price}</span>
                  <span className="text-[#9A9A94] text-sm">{plan.per}</span>
                  {plan.perMonth && <span className="text-[#9A9A94] text-xs">({plan.perMonth})</span>}
                </div>
                <p className="text-[#6B6B66] text-sm font-medium mb-3">{plan.label}</p>
                <div className="grid grid-cols-2 gap-y-1.5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={12} className="text-[#2DA4D6] flex-shrink-0" />
                      <span className="text-[#6B6B66] text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3.5 bg-[#2DA4D6] text-white font-bold text-sm rounded-xl hover:bg-[#2590bd] transition-all">
        {selected === currentPlan ? 'Manage Billing' : `Switch to ${PLANS.find(p => p.id === selected)?.label}`}
      </button>

      <p className="text-center text-[#9A9A94] text-xs">
        Cancel anytime. No lock-in contracts. Payments processed securely.
      </p>
    </div>
  );
}