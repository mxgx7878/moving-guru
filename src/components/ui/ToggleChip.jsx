// Small pill-shaped selector used inside groups (disciplines,
// languages, open-to, studio size, position type, etc.).
//
// Unlike `Button`, this is a radio-/checkbox-style affordance where
// the "active" appearance is the selected state and the rest are
// unselected siblings. Designed to go in a `flex flex-wrap gap-*`
// container — typically via the companion `ChipGroup` below.
//
// Pair with `onRemove` to render a small X inside the chip (for
// summary strips where removing the chip deselects the option).
import { X } from 'lucide-react';

const TONE = {
  coral: {
    active:   'bg-coral text-white border-coral',
    inactive: 'bg-white border-edge text-ink-muted hover:border-coral',
  },
  blue: {
    active:   'bg-sky-mg text-white border-sky-mg',
    inactive: 'bg-white border-edge text-ink-muted hover:border-sky-mg',
  },
  ink: {
    active:   'bg-ink text-white border-ink',
    inactive: 'bg-white border-edge text-ink-muted hover:border-ink',
  },
  chartreuse: {
    active:   'bg-chartreuse text-ink border-chartreuse',
    inactive: 'bg-white border-edge text-ink-muted hover:border-ink',
  },
  // Soft active (e.g. summary chips that aren't in a radio group)
  softBlue: {
    active:   'bg-sky-soft text-sky-mg border-sky-soft',
    inactive: 'bg-white border-edge text-ink-muted hover:border-sky-mg',
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
