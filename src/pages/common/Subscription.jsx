import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check, Star, ArrowRight, AlertCircle, Crown, Shield, Sparkles } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { fetchPlans, changePlan } from '../../store/actions/subscriptionAction';
import { STATUS } from '../../constants/apiConstants';
import { CardSkeleton } from '../../components/feedback';
import { ButtonLoader } from '../../components/feedback';

const PLAN_ICONS = { monthly: Shield, biannual: Crown, annual: Sparkles };

export default function Subscription() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { plans, status } = useSelector((s) => s.subscription);
  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  const [selected, setSelected] = useState(user?.subscription || 'monthly');
  const [confirming, setConfirming] = useState(false);
  const [changed, setChanged] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const currentPlan = plans.find(p => p.id === (user?.subscription || 'monthly'));
  const selectedPlan = plans.find(p => p.id === selected);

  const handleChange = () => {
    if (selected === user?.subscription) return;
    setConfirming(true);
  };

  const confirmChange = async () => {
    setChanging(true);
    await dispatch(changePlan({ plan: selected }));
    setChanging(false);
    setConfirming(false);
    setChanged(true);
    setTimeout(() => setChanged(false), 3000);
  };

  if (status === STATUS.LOADING && plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Subscription</h1>
          <p className="text-[#9A9A94] text-sm mt-1">Manage your Moving Guru membership</p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Subscription</h1>
        <p className="text-[#9A9A94] text-sm mt-1">
          Manage your Moving Guru {role === 'studio' ? 'studio ' : ''}membership
        </p>
      </div>

      {/* Current plan banner */}
      <div className="bg-gradient-to-br from-[#FDFCF8] to-[#f5fca6]/40 rounded-2xl p-6 overflow-hidden relative border border-[#E5E0D8]">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: `radial-gradient(circle at 80% 50%, ${theme.accent} 0%, transparent 50%)` }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.accent}15` }}>
              <Star size={22} style={{ color: theme.accent }} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[#9A9A94] text-[10px] uppercase tracking-widest">Current Plan</p>
              <p className="font-['Unbounded'] text-[#3E3D38] font-black text-lg mt-0.5">
                {currentPlan?.label || 'Monthly'}
              </p>
              <p className="text-sm font-semibold" style={{ color: theme.accent }}>
                ${currentPlan?.price || 15}{currentPlan?.per || '/mo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[#9A9A94] text-[10px] uppercase tracking-wider">Renews</p>
              <p className="text-[#3E3D38] text-sm font-semibold mt-0.5">{user?.subscriptionRenews || user?.subscription_renews || '—'}</p>
            </div>
            <div className="text-center">
              <p className="text-[#9A9A94] text-[10px] uppercase tracking-wider">Status</p>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-white mt-0.5" style={{ backgroundColor: theme.accent }}>
                Active
              </span>
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
        <h3 className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] mb-5 text-center">Choose a Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
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
                    ? 'scale-[1.02] shadow-xl text-white'
                    : 'border-[#E5E0D8] bg-white hover:shadow-md'
                  }
                  ${plan.highlight && !isSelected ? 'ring-2 ring-opacity-20' : ''}`}
                style={isSelected ? { borderColor: theme.accent, backgroundColor: theme.accent } : undefined}
              >
                {plan.highlight && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase
                    ${isSelected ? 'bg-[#f5fca6] text-[#3E3D38]' : 'text-white'}`}
                    style={!isSelected ? { backgroundColor: theme.accent } : undefined}
                  >
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col items-center text-center mb-4 mt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3
                    ${isSelected ? 'bg-white/20' : ''}`}
                    style={!isSelected ? { backgroundColor: `${theme.accent}12` } : undefined}
                  >
                    <PlanIcon size={22} className={isSelected ? 'text-white' : ''} style={!isSelected ? { color: theme.accent } : undefined} />
                  </div>
                  <span className={`font-['Unbounded'] text-sm font-bold ${isSelected ? 'text-white' : 'text-[#3E3D38]'}`}>
                    {plan.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-[#6BE6A4]/20 text-[#3E3D38] px-2.5 py-0.5 rounded-full mt-1.5">
                      Current
                    </span>
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className={`font-['Unbounded'] text-3xl font-black ${isSelected ? 'text-white' : 'text-[#3E3D38]'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-white/50' : 'text-[#9A9A94]'}`}>
                      {plan.per}
                    </span>
                  </div>
                  {plan.pricePerMonth && (
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/50' : 'text-[#9A9A94]'}`}>
                      {plan.pricePerMonth}
                    </p>
                  )}
                </div>

                <div className={`w-full h-px mb-4 ${isSelected ? 'bg-white/15' : 'bg-[#E5E0D8]'}`} />

                <ul className="space-y-2.5 flex-1">
                  {(plan.features || []).map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isSelected ? 'bg-white/20' : ''}`}
                        style={!isSelected ? { backgroundColor: `${theme.accent}15` } : undefined}
                      >
                        <Check size={9} className={isSelected ? 'text-white' : ''} style={!isSelected ? { color: theme.accent } : undefined} />
                      </div>
                      <span className={`text-xs leading-relaxed ${isSelected ? 'text-white/70' : 'text-[#6B6B66]'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className={`mt-5 py-2.5 rounded-xl text-center text-xs font-bold transition-all
                  ${isSelected ? 'bg-white' : 'bg-[#FBF8E4] text-[#9A9A94]'}`}
                  style={isSelected ? { color: theme.accent } : undefined}
                >
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
            className="text-white font-bold py-3.5 px-10 rounded-xl transition-all flex items-center gap-2 shadow-lg"
            style={{ backgroundColor: theme.accent }}
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
            <div className="w-12 h-12 bg-[#E89560]/15 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} className="text-[#E89560]" />
            </div>
            <h3 className="font-['Unbounded'] text-base font-black text-[#3E3D38] mb-2 text-center">Confirm Plan Change</h3>
            <p className="text-[#6B6B66] text-sm mb-5 leading-relaxed text-center">
              You're switching from <strong className="text-[#3E3D38]">{currentPlan?.label}</strong> to{' '}
              <strong className="text-[#3E3D38]">{selectedPlan?.label}</strong> for{' '}
              <strong className="text-[#3E3D38]">${selectedPlan?.price}{selectedPlan?.per}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors">
                Cancel
              </button>
              <button onClick={confirmChange} disabled={changing}
                className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accent }}>
                {changing ? <ButtonLoader size={14} /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel */}
      <p className="text-center text-[#9A9A94] text-xs pb-4">
        Cancel anytime. No lock-in contracts. Payments processed securely.
      </p>
    </div>
  );
}
