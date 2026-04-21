import { ButtonLoader } from '../feedback';

// Reusable Button used across the whole app so every action looks and
// behaves the same. Variants cover the four colour families the brand
// uses; sizes are the three heights that appear in the Figma.
const VARIANT = {
  primary:   'bg-[#2DA4D6] text-white border-[#2DA4D6] hover:bg-[#2590bd]',
  danger:    'bg-[#CE4F56] text-white border-[#CE4F56] hover:bg-[#b8454c]',
  accent:    'bg-[#3E3D38] text-[#f5fca6] border-[#3E3D38] hover:bg-black',
  success:   'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600',
  secondary: 'bg-white text-[#6B6B66] border-[#E5E0D8] hover:border-[#9A9A94]',
  ghost:     'bg-transparent text-[#6B6B66] border-transparent hover:bg-[#FBF8E4]',
  outlineDanger: 'bg-white text-[#CE4F56] border-[#CE4F56] hover:bg-[#CE4F56]/5',
};

const SIZE = {
  xs: 'px-3 py-1.5 text-[11px] rounded-lg',
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  fullWidth = false,
  className = '',
  ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold border transition-all disabled:opacity-60 disabled:cursor-not-allowed';
  const variantCls = VARIANT[variant] || VARIANT.primary;
  const sizeCls = SIZE[size] || SIZE.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variantCls} ${sizeCls} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading
        ? <ButtonLoader size={14} color={variant === 'secondary' || variant === 'ghost' ? '#6B6B66' : '#fff'} />
        : Icon && <Icon size={14} />}
      {children}
      {!loading && IconRight && <IconRight size={14} />}
    </button>
  );
}
