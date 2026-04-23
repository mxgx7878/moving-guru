// Label-on-top / value-below pair used in detail drawers. Pass `icon` to
// render an icon next to the label. Returns null when the value is empty
// to avoid rendering blank rows.
export default function InfoRow({ label, value, icon: Icon, hideEmpty = false, className = '' }) {
  if (hideEmpty && !value) return null;
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-0.5">
        {Icon && <Icon size={10} />} {label}
      </p>
      <p className="text-[#3E3D38]">
        {value || <span className="text-[#C4BCB4]">—</span>}
      </p>
    </div>
  );
}
