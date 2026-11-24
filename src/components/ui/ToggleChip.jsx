import { X } from 'lucide-react';

const TONE = {
  coral: {
    active:   'bg-coral text-black border-coral',
    inactive: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#4E7A1B] hover:text-[#3E3D38]',
  },
  blue: {
    active:   'bg-coral text-black border-coral',
    inactive: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#4E7A1B] hover:text-[#3E3D38]',
  },
  ink: {
    active:   'bg-coral text-black border-coral',
    inactive: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#4E7A1B] hover:text-[#3E3D38]',
  },
  chartreuse: {
    active:   'bg-coral text-black border-coral',
    inactive: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#4E7A1B] hover:text-[#3E3D38]',
  },
  softBlue: {
    active:   'bg-coral text-black border-coral',
    inactive: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#4E7A1B] hover:text-[#3E3D38]',
  },
};

const SIZE = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-3.5 py-2 text-xs',
};

export default function ToggleChip({
  children,
  active = false,
  onClick,
  onRemove,
  tone = 'blue',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const toneSet = TONE[tone] || TONE.blue;
  const sizeCls = SIZE[size] || SIZE.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${active ? toneSet.active : toneSet.inactive} ${className}`}
      {...rest}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="inline-flex items-center justify-center ml-0.5 hover:opacity-70"
          aria-label="Remove"
        >
          <X size={10} />
        </span>
      )}
    </button>
  );
}
