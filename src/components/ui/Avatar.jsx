import { getInitials } from '../../utils/getInitials';

// Initials-based avatar shared across every user/studio/instructor display.
// Pass `src` to render an image instead (falls back to initials if it fails).
// `tone` picks the brand colour; `shape` switches between circle and
// rounded-square. Sizes map to the heights used in the app today.
const SIZE = {
  xs: 'w-7 h-7 text-[9px]',
  sm: 'w-9 h-9 text-[10px]',
  md: 'w-11 h-11 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-base',
};

const TONE = {
  coral:  'bg-[#CE4F56] text-white',
  blue:   'bg-[#2DA4D6] text-white',
  purple: 'bg-[#7F77DD] text-white',
  dark:   'bg-[#3E3D38] text-white',
  muted:  'bg-[#F5F0E8] text-[#6B6B66]',
};

export default function Avatar({
  name,
  src,
  size = 'sm',
  tone = 'coral',
  shape = 'circle',
  className = '',
}) {
  const sizeCls = SIZE[size] || SIZE.sm;
  const shapeCls = shape === 'square' ? 'rounded-2xl' : 'rounded-full';
  const base = `${sizeCls} ${shapeCls} flex items-center justify-center flex-shrink-0 font-bold overflow-hidden ${className}`;

  if (src) {
    return (
      <div className={`${base} bg-[#F5F0E8]`}>
        <img
          src={src}
          alt={name || ''}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    );
  }

  return (
    <div className={`${base} ${TONE[tone] || TONE.coral}`}>
      {getInitials(name)}
    </div>
  );
}
