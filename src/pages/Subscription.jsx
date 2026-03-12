import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '../data/dummyData';
import { Check, Star, Zap, ArrowRight, AlertCircle, Crown, Shield, Sparkles } from 'lucide-react';

const PLAN_ICONS = { monthly: Shield, biannual: Crown, annual: Sparkles };

export default function Subscription() {
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState(user?.subscription || 'monthly');
  const [confirming, setConfirming] = useState(false);
  const [changed, setChanged] = useState(false);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === (user?.subscription || 'monthly'));
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selected);

  const handleChange = () => {
    if (selected === user?.subscription) return;
    setConfirming(true);
  };

  const confirmChange = () => {
    updateUser({ subscription: selected, subscriptionPrice: selectedPlan.price });
    setConfirming(false);
    setChanged(true);
    setTimeout(() => setChanged(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-['Unbounded'] text-xl font-black text-black">Subscription</h1>
        <p className="text-black/40 text-sm mt-1">Manage your Moving Guru membership</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: `radial-gradient(circle at 80% 50%, #d4f53c 0%, transparent 50%)` }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d4f53c]/20 rounded-2xl flex items-center justify-center">
              <Star size={22} className="text-[#d4f53c]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Current Plan</p>
              <p className="font-['Unbounded'] text-white font-black text-lg mt-0.5">
                {currentPlan?.label}
              </p>
              <p className="text-[#d4f53c] text-sm font-semibold">${currentPlan?.price}{currentPlan?.per}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Renews</p>
              <p className="text-white/70 text-sm font-semibold mt-0.5">{user?.subscriptionRenews || '—'}</p>
            </div>
            <div className="text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Member Since</p>
              <p className="text-white/70 text-sm font-semibold mt-0.5">{user?.memberSince || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {changed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
          <Check size={14} className="text-emerald-600" />
          <p className="text-emerald-700 text-sm font-medium">Plan updated successfully!</p>
        </div>
      )}

      {/* Plans grid */}
      <div>
        <h3 className="font-['Unbounded'] text-sm font-bold text-black mb-5 text-center">Choose a Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map(plan => {
            const isCurrent = plan.id === (user?.subscription || 'monthly');
            const isSelected = plan.id === selected;
            const PlanIcon = PLAN_ICONS[plan.id] || Shield;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-300 flex flex-col
                  ${isSelected
                    ? 'border-[#d4f53c] bg-black scale-[1.02] shadow-xl'
                    : 'border-black/10 bg-white hover:border-black/25 hover:shadow-md'
                  }
                  ${plan.highlight && !isSelected ? 'ring-2 ring-[#d4f53c]/30' : ''}`}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase
                    ${isSelected ? 'bg-[#d4f53c] text-black' : 'bg-[#d4f53c] text-black'}`}>
                    Most Popular
                  </div>
                )}

                {/* Icon & label */}
                <div className="flex flex-col items-center text-center mb-4 mt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3
                    ${isSelected ? 'bg-[#d4f53c]/20' : 'bg-black/5'}`}>
                    <PlanIcon size={22} className={isSelected ? 'text-[#d4f53c]' : 'text-black/40'} />
                  </div>
                  <span className={`font-['Unbounded'] text-sm font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                    {plan.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-[#d4f53c]/20 text-[#8fa020] px-2.5 py-0.5 rounded-full mt-1.5">
                      Current
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className={`font-['Unbounded'] text-3xl font-black ${isSelected ? 'text-white' : 'text-black'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-white/40' : 'text-black/30'}`}>
                      {plan.per}
                    </span>
                  </div>
                  {plan.pricePerMonth && (
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/40' : 'text-black/40'}`}>
                      {plan.pricePerMonth}
                    </p>
                  )}
                  {plan.save && (
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full
                      ${isSelected ? 'bg-[#d4f53c] text-black' : 'bg-[#d4f53c]/15 text-[#8fa020]'}`}>
                      {plan.save}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className={`w-full h-px mb-4 ${isSelected ? 'bg-white/10' : 'bg-black/8'}`} />

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isSelected ? 'bg-[#d4f53c]/20' : 'bg-black/5'}`}>
                        <Check size={9} className={isSelected ? 'text-[#d4f53c]' : 'text-black/40'} />
                      </div>
                      <span className={`text-xs leading-relaxed ${isSelected ? 'text-white/60' : 'text-black/50'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div className={`mt-5 py-2.5 rounded-xl text-center text-xs font-bold transition-all
                  ${isSelected
                    ? 'bg-[#d4f53c] text-black'
                    : 'bg-black/5 text-black/30'
                  }`}>
                  {isSelected ? (isCurrent ? 'Current Plan' : 'Selected') : 'Select'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Change plan button */}
      {selected !== (user?.subscription || 'monthly') && (
        <div className="flex justify-center">
          <button
            onClick={handleChange}
            className="bg-[#d4f53c] text-black font-bold py-3.5 px-10 rounded-xl hover:bg-[#c4e530] transition-all flex items-center gap-2 shadow-lg shadow-[#d4f53c]/25"
          >
            Switch to {selectedPlan?.label} — ${selectedPlan?.price}{selectedPlan?.per}
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-[#e8834a]/15 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} className="text-[#e8834a]" />
            </div>
            <h3 className="font-['Unbounded'] text-base font-black text-black mb-2 text-center">Confirm Plan Change</h3>
            <p className="text-black/50 text-sm mb-5 leading-relaxed text-center">
              You're switching from <strong className="text-black">{currentPlan?.label}</strong> to{' '}
              <strong className="text-black">{selectedPlan?.label}</strong> for{' '}
              <strong className="text-black">${selectedPlan?.price}{selectedPlan?.per}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 border border-black/15 rounded-xl text-sm font-medium text-black/50 hover:border-black/30 transition-colors">
                Cancel
              </button>
              <button onClick={confirmChange}
                className="flex-1 py-2.5 bg-black text-[#d4f53c] rounded-xl text-sm font-bold hover:bg-black/90 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launch promo */}
      <div className="bg-gradient-to-br from-[#d4f53c]/20 to-[#e8834a]/10 border border-[#d4f53c]/30 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-[#d4f53c] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap size={22} className="text-black" />
        </div>
        <p className="font-['Unbounded'] text-sm font-bold text-black mb-3">Launch Promotion</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="font-['Unbounded'] text-xs font-bold text-black">34 Studios</p>
            <p className="text-[11px] text-black/50 mt-0.5">Free lifetime membership</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="font-['Unbounded'] text-xs font-bold text-black">100 Instructors</p>
            <p className="text-[11px] text-black/50 mt-0.5">Free lifetime membership</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="font-['Unbounded'] text-xs font-bold text-black">100 Studios</p>
            <p className="text-[11px] text-black/50 mt-0.5">First 6 months free</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="font-['Unbounded'] text-xs font-bold text-black">Founding Members</p>
            <p className="text-[11px] text-black/50 mt-0.5">3 months for $2 (first 20K)</p>
          </div>
        </div>
      </div>

      {/* Cancel */}
      <div className="text-center pb-4">
        <button className="text-xs text-black/25 hover:text-red-400 transition-colors underline">
          Cancel subscription
        </button>
      </div>
    </div>
  );
}
