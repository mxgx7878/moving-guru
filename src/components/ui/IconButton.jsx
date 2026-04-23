// Small square icon-only button used for inline row actions
// (view / approve / suspend / delete etc). `tone` picks a hover colour
// family; `tone="green-active"` renders the pressed/active look.
const TONE = {
  default:        'border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]',
  green:          'border-[#E5E0D8] text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500',
  'green-active': 'border-emerald-500 text-emerald-600 bg-emerald-50',
  red:            'border-[#E5E0D8] text-red-500 hover:bg-red-50 hover:border-red-500',
  blue:           'border-[#E5E0D8] text-[#2DA4D6] hover:bg-[#2DA4D6]/5 hover:border-[#2DA4D6]',
};

export default function IconButton({
  children,
  title,
  onClick,
  disabled,
  tone = 'default',
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${TONE[tone] || TONE.default} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
