const SYMBOLS = { USD: '$', AUD: '$', CAD: '$', NZD: '$', GBP: '£', EUR: '€', INR: '₹', AED: 'د.إ' };

export default function PlanPrice({ plan, className = '' }) {
  const sym        = SYMBOLS[(plan?.currency || 'USD').toUpperCase()] || '$';
  const price      = Number(plan?.price ?? 0);
  const discounted = Number(plan?.discountedPrice ?? price);
  const hasDiscount = Boolean(plan?.hasDiscount) && discounted < price;
  const period     = plan?.period || '';

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {hasDiscount && (
        <span className="text-base text-[#9A9A94] line-through">{sym}{price.toFixed(2)}</span>
      )}
      <span className="font-unbounded text-3xl font-black text-[#3E3D38]">
        {sym}{(hasDiscount ? discounted : price).toFixed(2)}
      </span>
      {period && <span className="text-sm text-[#9A9A94]">{period}</span>}
    </div>
  );
}