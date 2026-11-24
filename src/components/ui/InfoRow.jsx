export default function InfoRow({ label, value, icon: Icon, hideEmpty = false, className = '' }) {
  if (hideEmpty && !value) return null;
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-ink-muted tracking-widest uppercase mb-0.5">
        {Icon && <Icon size={10} />} {label}
      </p>
      <p className="text-[#3E3D38]">
        {value || <span className="text-ink-muted">—</span>}
      </p>
    </div>
  );
}
