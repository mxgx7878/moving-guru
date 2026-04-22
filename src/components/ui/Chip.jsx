// Tiny rounded tag used for disciplines, languages, amenities, role labels,
// verified badges — anything that's a single word/phrase in a pill.
// `tone` picks one of the brand colour families; pass an `icon` component
// to render it inline with the label.
const TONE = {
  neutral: 'bg-[#F5F0E8] text-[#6B6B66]',
  coral:   'bg-[#CE4F56]/15 text-[#CE4F56]',
  blue:    'bg-[#2DA4D6]/15 text-[#2DA4D6]',
  purple:  'bg-[#7F77DD]/15 text-[#7F77DD]',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red:     'bg-red-50 text-red-700 border border-red-200',
  yellow:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const SIZE = {
  xs: 'text-[10px] px-2 py-0.5',
  sm: 'text-[11px] px-2 py-1',
  md: 'text-xs px-3 py-1.5',
};

export default function Chip({
  children,
  icon: Icon,
  tone = 'neutral',
  size = 'sm',
  className = '',
  onClick,
}) {
  const cls = `inline-flex items-center gap-1 font-medium rounded-full ${TONE[tone] || TONE.neutral} ${SIZE[size] || SIZE.sm} ${className}`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} hover:opacity-80 transition-opacity`}>
        {Icon && <Icon size={10} />} {children}
      </button>
    );
  }
  return (
    <span className={cls}>
      {Icon && <Icon size={10} />} {children}
    </span>
  );
}
