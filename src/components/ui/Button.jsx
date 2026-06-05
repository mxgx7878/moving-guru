import { ButtonLoader } from '../feedback';

// Reusable Button used across the whole app. Props cover three axes:
//
//   variant   — colour family (solid / outline / tinted / ghost)
//   size      — xs | sm | md | lg — brand heights from the Figma
//   state     — 'default' (interactive) | 'static' (non-interactive result
//               badge — same shape, no opacity dim, no not-allowed cursor)
//
// Passing `loading` swaps the icon for a spinner. `disabled` dims the button
// normally; for "result" displays (Accepted / Applied / Closed) use
// `state="static"` so the pill stays fully opaque.
// Brand palette: GREEN #B4FF5A, YELLOW #F5FDA6, BLACK #1A1A1A, WHITE #FFFFFF.
// Buttons are green by default; use `yellow`/`accent` to differentiate two
// buttons sitting next to each other. Text on the bright fills is black.
const VARIANT = {
  // ── Solid, interactive ──────────────────────────────────────────
  primary:   'bg-[#B4FF5A] text-[#1A1A1A] border-[#B4FF5A] hover:bg-[#9BE63D]',
  // `yellow` / `accent` are the differentiator buttons (yellow fill).
  yellow:    'bg-[#F5FDA6] text-[#1A1A1A] border-[#F5FDA6] hover:bg-[#ECF77A]',
  accent:    'bg-[#F5FDA6] text-[#1A1A1A] border-[#F5FDA6] hover:bg-[#ECF77A]',
  // Destructive actions use yellow so they read distinct from the green
  // primary while staying on-palette (no red on the site).
  danger:    'bg-[#F5FDA6] text-[#1A1A1A] border-[#F5FDA6] hover:bg-[#ECF77A]',
  success:   'bg-[#B4FF5A] text-[#1A1A1A] border-[#B4FF5A] hover:bg-[#9BE63D]',

  // ── Outline / neutral ───────────────────────────────────────────
  secondary:     'bg-white text-[#1A1A1A] border-[#E5E0D8] hover:border-[#9A9A94]',
  ghost:         'bg-transparent text-[#6B6B66] border-transparent hover:bg-[#FAFEE0]',
  outlineDanger: 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#1A1A1A]/5',

  // ── Tinted (low-contrast, usually paired with state="static") ──
  infoSoft:    'bg-[#B4FF5A]/20 text-[#3F6216] border-[#B4FF5A]/50 hover:bg-[#B4FF5A]/30',
  dangerSoft:  'bg-[#F5FDA6]/50 text-[#7E811F] border-[#F5FDA6] hover:bg-[#F5FDA6]/70',
  successSoft: 'bg-[#B4FF5A]/20 text-[#3F6216] border-[#B4FF5A]/50 hover:bg-[#B4FF5A]/30',
  mutedSoft:   'bg-[#FAFEE0] text-[#9A9A94] border-[#E5E0D8]',
};

const SIZE = {
  xs: 'px-3 py-1.5 text-[11px] rounded-lg',
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

// Outline / neutral variants render the spinner in the muted grey; all the
// solid fills (green / yellow) carry black text, so their spinner is black.
const MUTED_LOADER_VARIANTS = new Set([
  'secondary', 'ghost', 'outlineDanger',
  'infoSoft', 'dangerSoft', 'successSoft', 'mutedSoft',
]);

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  state = 'default',    // 'default' | 'static'
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  fullWidth = false,
  className = '',
  ...rest
}) {
  const isStatic = state === 'static';

  const base = 'inline-flex items-center justify-center gap-2 font-bold border transition-all';
  const interactiveCls = isStatic
    ? 'cursor-default'
    : 'disabled:opacity-60 disabled:cursor-not-allowed';

  const variantCls = VARIANT[variant] || VARIANT.primary;
  const sizeCls    = SIZE[size] || SIZE.md;
  const loaderColor = MUTED_LOADER_VARIANTS.has(variant) ? '#6B6B66' : '#1A1A1A';

  return (
    <button
      type={type}
      disabled={isStatic || disabled || loading}
      className={`${base} ${interactiveCls} ${variantCls} ${sizeCls} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading
        ? <ButtonLoader size={14} color={loaderColor} />
        : Icon && <Icon size={14} />}
      {children}
      {!loading && IconRight && <IconRight size={14} />}
    </button>
  );
}
