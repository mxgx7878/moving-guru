import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckCircle2, X } from 'lucide-react';
import { validateGrowPromoCode } from '../../store/actions/growPromoAction';
import { Button } from '../../components/ui';

/**
 * Promo-code input for the Grow LISTING checkout.
 *
 * Validates a Grow-only promo code against the selected pricing tier and
 * reports the server's price preview back up via `onApplied`. The parent
 * passes `applied.code` to the payment intent; the backend re-computes the
 * authoritative discount, so this is display-only.
 *
 * Re-validates automatically if the selected tier changes while a code is
 * applied, and clears the code if it becomes invalid for the new tier.
 */
export default function GrowPromoField({ pricingTierId, onApplied, className = '' }) {
  const dispatch = useDispatch();
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);
  const [applied, setApplied] = useState(null);

  const runValidate = async (rawCode, tierId) => {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed || !tierId) return null;
    setLoading(true); setErr(null);
    const result = await dispatch(validateGrowPromoCode({ code: trimmed, pricingTierId: tierId }));
    setLoading(false);
    if (validateGrowPromoCode.fulfilled.match(result)) {
      const data = { ...result.payload, code: trimmed };
      setApplied(data);
      onApplied?.(data);
      return data;
    }
    setErr(typeof result.payload === 'string' ? result.payload : 'Invalid promo code.');
    return null;
  };

  const apply = () => runValidate(code, pricingTierId);

  // If the tier changes while a code is applied, re-check it against the new tier.
  useEffect(() => {
    if (!applied) return;
    runValidate(applied.code, pricingTierId).then((data) => {
      if (!data) { setApplied(null); onApplied?.(null); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingTierId]);

  const clear = () => { setApplied(null); setCode(''); setErr(null); onApplied?.(null); };

  if (applied) {
    const label = applied.discountType === 'percent'
      ? `${Number(applied.discountValue)}% off`
      : `${applied.currency || ''} ${Number(applied.discountValue)} off`;
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
        <Button variant="secondary" onClick={apply} loading={loading} disabled={!code.trim() || !pricingTierId}>Apply</Button>
      </div>
      {err && <p className="text-xs text-rose-500 mt-1">{err}</p>}
    </div>
  );
}
