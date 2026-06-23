import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckCircle2, X } from 'lucide-react';
import { validatePromoCode } from '../../store/actions/promoCodeAction';
import { Button } from '../../components/ui';

export default function PromoCodeField({ onApplied, className = '' }) {
  const dispatch = useDispatch();
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);
  const [applied, setApplied] = useState(null);

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true); setErr(null);
    const result = await dispatch(validatePromoCode({ code: trimmed }));
    setLoading(false);
    if (validatePromoCode.fulfilled.match(result)) {
      const data = { ...result.payload, code: trimmed };
      setApplied(data);
      onApplied?.(data);
    } else {
      setErr(typeof result.payload === 'string' ? result.payload : 'Invalid promo code.');
    }
  };

  const clear = () => { setApplied(null); setCode(''); setErr(null); onApplied?.(null); };

  if (applied) {
    const label = applied.discountType === 'percent'
      ? `${Number(applied.discountValue)}% off`
      : `${Number(applied.discountValue)} off`;
    return (
      <div className={`flex items-center justify-between gap-2 bg-[#B4FF5A]/30 border border-[#B4FF5A] rounded-xl px-3 py-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-[#3E3D38] min-w-0">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="font-semibold font-mono truncate">{applied.code}</span>
          <span className="text-[#6B6B66] flex-shrink-0">— {label}</span>
        </div>
        <button onClick={clear} aria-label="Remove promo code" className="text-[#9A9A94] hover:text-[#3E3D38] flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Have a promo code?"
          className="flex-1 min-w-0 border border-[#E5E0D8] rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-coral"
        />
        <Button variant="secondary" onClick={apply} loading={loading} disabled={!code.trim()}>Apply</Button>
      </div>
      {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
    </div>
  );
}