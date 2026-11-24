export default function InfoTile({ icon, label, value, className = '' }) {
  return (
    <div className={`bg-[#FAFEE0]/50 rounded-xl p-3 ${className}`}>
      <p className="text-[9px] text-ink-muted uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1.5">
        {icon && <span className="text-ink-muted">{icon}</span>} {value}
      </p>
    </div>
  );
}
