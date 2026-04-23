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
const VARIANT = {
  // ── Solid, interactive ──────────────────────────────────────────
  primary:   'bg-[#2DA4D6] text-white border-[#2DA4D6] hover:bg-[#2590bd]',
  danger:    'bg-[#CE4F56] text-white border-[#CE4F56] hover:bg-[#b8454c]',
  accent:    'bg-[#3E3D38] text-[#f5fca6] border-[#3E3D38] hover:bg-black',
  success:   'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600',

  // ── Outline / neutral ───────────────────────────────────────────
  secondary:     'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#9A9A94]',
  ghost:         'bg-transparent text-[#6B6B66] border-transparent hover:bg-[#FBF8E4]',
  outlineDanger: 'bg-white text-[#CE4F56] border-[#CE4F56] hover:bg-[#CE4F56]/5',

  // ── Tinted (low-contrast, usually paired with state="static") ──
  infoSoft:    'bg-[#2DA4D6]/10 text-[#2DA4D6] border-[#2DA4D6]/30 hover:bg-[#2DA4D6]/15',
  dangerSoft:  'bg-red-50 text-red-500 border-red-200 hover:bg-red-100',
  successSoft: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  mutedSoft:   'bg-[#FBF8E4] text-[#9A9A94] border-[#E5E0D8]',
};

const SIZE = {
  xs: 'px-3 py-1.5 text-[11px] rounded-lg',
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

// Variants where the button text is already dark on white — ButtonLoader
// needs the muted color instead of the default white.
const DARK_TEXT_VARIANTS = new Set([
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
  const loaderColor = DARK_TEXT_VARIANTS.has(variant) ? '#6B6B66' : '#fff';

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
