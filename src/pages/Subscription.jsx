import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '../data/dummyData';
import { Check, Star, Zap, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-['Unbounded'] text-xl font-black text-black">Subscription</h1>
        <p className="text-black/40 text-sm mt-1">Manage your Moving Guru membership</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-[#0f0f0f] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#d4f53c]/20 rounded-xl flex items-center justify-center">
            <Star size={18} className="text-[#d4f53c]" />
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Current Plan</p>
            <p className="font-['Unbounded'] text-white font-black text-sm mt-0.5">
              {currentPlan?.label} — ${currentPlan?.price}{currentPlan?.per}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Renews</p>
          <p className="text-white/70 text-xs font-medium mt-0.5">{user?.subscriptionRenews || '—'}</p>
        </div>
      </div>

      {changed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check size={14} className="text-emerald-600" />
          <p className="text-emerald-700 text-sm font-medium">Plan updated successfully!</p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h3 className="font-['Unbounded'] text-sm font-bold text-black mb-4">Choose a Plan</h3>
        <div className="space-y-3">
          {SUBSCRIPTION_PLANS.map(plan => {
            const isCurrent = plan.id === (user?.subscription || 'monthly');
            const isSelected = plan.id === selected;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
                  ${isSelected
                    ? 'border-black bg-black'
                    : 'border-black/10 bg-white hover:border-black/25'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                      ${isSelected ? 'border-[#d4f53c]' : 'border-black/20'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#d4f53c]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-['Unbounded'] text-sm font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                          {plan.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-[#d4f53c]/20 text-[#8fa020] px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                        {plan.save && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${isSelected ? 'bg-[#d4f53c] text-black' : 'bg-[#d4f53c]/15 text-[#8fa020]'}`}>
                            {plan.save}
                          </span>
                        )}
                      </div>
                      {plan.pricePerMonth && (
                        <p className={`text-xs ${isSelected ? 'text-white/40' : 'text-black/40'}`}>
                          {plan.pricePerMonth}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2">
                            <Check size={11} className={isSelected ? 'text-[#d4f53c]' : 'text-black/30'} />
                            <span className={`text-xs ${isSelected ? 'text-white/60' : 'text-black/50'}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`font-['Unbounded'] text-2xl font-black ${isSelected ? 'text-white' : 'text-black'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-white/40' : 'text-black/30'}`}>
                      {plan.per}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Change plan button */}
      {selected !== (user?.subscription || 'monthly') && (
        <button
          onClick={handleChange}
          className="w-full bg-[#d4f53c] text-black font-bold py-3.5 rounded-xl hover:bg-[#c4e530] transition-all flex items-center justify-center gap-2"
        >
          Switch to {selectedPlan?.label} — ${selectedPlan?.price}{selectedPlan?.per}
          <ArrowRight size={16} />
        </button>
      )}

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-10 h-10 bg-[#e8834a]/15 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-[#e8834a]" />
            </div>
            <h3 className="font-['Unbounded'] text-base font-black text-black mb-2">Confirm Plan Change</h3>
            <p className="text-black/50 text-sm mb-5 leading-relaxed">
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
      <div className="bg-[#d4f53c]/20 border border-[#d4f53c]/40 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#d4f53c] rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-black" />
          </div>
          <div>
            <p className="font-['Unbounded'] text-xs font-bold text-black mb-2">🎉 Launch Promotion</p>
            <div className="space-y-1.5 text-xs text-black/60">
              <p>• 34 studios worldwide get <strong className="text-black">free lifetime membership</strong></p>
              <p>• 100 instructors get <strong className="text-black">free lifetime membership</strong></p>
              <p>• 100 studios internationally get <strong className="text-black">first 6 months free</strong></p>
              <p>• Founding members: <strong className="text-black">3 months for $2</strong> (first 20,000 members)</p>
            </div>
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
