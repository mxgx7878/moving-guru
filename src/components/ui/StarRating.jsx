import { Star } from 'lucide-react';

/**
 * StarRating
 * -----------------------------------------------------------------
 * Read-only by default. Pass `interactive` + `onChange` to turn it
 * into an input (used by ReviewForm). `size` is the pixel size of
 * each star icon.
 */
export default function StarRating({
  value = 0,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  className = '',
}) {
  const handleClick = (n) => {
    if (!interactive) return;
    onChange?.(n);
  };

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => handleClick(n)}
            disabled={!interactive}
            aria-label={`${n} star${n !== 1 ? 's' : ''}`}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
          >
            <Star
              size={size}
              className={filled ? 'text-[#E89560]' : 'text-[#E5E0D8]'}
              fill={filled ? '#E89560' : 'transparent'}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-xs font-semibold text-[#3E3D38]">
          {value ? Number(value).toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}