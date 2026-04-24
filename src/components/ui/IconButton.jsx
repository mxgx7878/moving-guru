// Icon-only button — used everywhere a bare icon needs to be clickable
// (modal close, row actions like view/approve/suspend/delete, bookmark
// toggles, edit pencils, chip-remove X, etc.)
//
// `tone`   — colour family for border + hover
// `size`   — xs | sm | md (matches Button size scale: icon 12/14/16)
// `variant`
//   'outline'  — default, bordered square (for table rows / inline actions)
//   'plain'    — no border, just hover bg (for modal X close / headers)
//   'soft'     — tinted background (for prominent heart/save toggles)
// `active`  — for toggle buttons, renders the pressed state
const TONE = {
  default: {
    outline: 'border-edge text-ink-muted hover:border-ink',
    plain:   'text-ink-soft hover:bg-cream hover:text-ink-muted',
    soft:    'bg-cream text-ink-muted hover:bg-cream-soft',
    active:  'border-ink bg-ink text-white',
  },
  green: {
    outline: 'border-edge text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500',
    plain:   'text-emerald-600 hover:bg-emerald-50',
    soft:    'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    active:  'border-emerald-500 bg-emerald-50 text-emerald-600',
  },
  red: {
    outline: 'border-edge text-red-500 hover:bg-red-50 hover:border-red-500',
    plain:   'text-red-500 hover:bg-red-50',
    soft:    'bg-red-50 text-red-500 hover:bg-red-100',
    active:  'border-red-500 bg-red-50 text-red-500',
  },
  coral: {
    outline: 'border-edge text-coral hover:bg-coral-soft hover:border-coral',
    plain:   'text-coral hover:bg-coral-soft',
    soft:    'bg-coral-soft text-coral hover:bg-coral/10',
    active:  'border-coral bg-coral-soft text-coral',
  },
  blue: {
    outline: 'border-edge text-sky-mg hover:bg-sky-soft hover:border-sky-mg',
    plain:   'text-sky-mg hover:bg-sky-soft',
    soft:    'bg-sky-soft text-sky-mg hover:bg-sky-mg/15',
    active:  'border-sky-mg bg-sky-soft text-sky-mg',
  },
};

// Legacy alias — old callers pass tone="green-active" as a pre-mixed state.
const LEGACY_TONE = {
  'green-active': { cls: TONE.green.active, variant: 'outline' },
};

const SIZE = {
  xs: 'p-1 rounded-md',
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-lg',
};

export default function IconButton({
  children,
  title,
  onClick,
  disabled,
  tone = 'default',
  size = 'sm',
  variant = 'outline',
  active = false,
  type = 'button',
  className = '',
  ...rest
}) {
  // Support legacy tone="green-active" by flipping to `active` internally.
  let toneKey = tone;
  let effectiveActive = active;
  if (LEGACY_TONE[tone]) {
    toneKey = tone.split('-')[0];
    effectiveActive = true;
  }

  const toneSet = TONE[toneKey] || TONE.default;
  const stateCls = effectiveActive
    ? toneSet.active
    : toneSet[variant] || toneSet.outline;

  // Outline variant keeps a border at all times; plain/soft have no border.
  const borderCls = (variant === 'outline' || effectiveActive) ? 'border' : 'border-0';

  const sizeCls = SIZE[size] || SIZE.sm;

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${sizeCls} ${borderCls} transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${stateCls} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
