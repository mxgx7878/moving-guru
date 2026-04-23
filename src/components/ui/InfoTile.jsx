// Small cream-tinted info tile used on public / instructor / studio
// detail pages. Shape is compact: uppercase label on top, then a row of
// "icon + value" below. Used anywhere a tiny "stat with icon" needs to
// sit in a grid (date, location, experience, languages, etc).
//
// Distinct from StatTile (drawer tile, bigger number) and StatCard
// (full card with trend badge). InfoTile's vibe is "labelled detail".
export default function InfoTile({ icon, label, value, className = '' }) {
  return (
    <div className={`bg-[#FBF8E4]/50 rounded-xl p-3 ${className}`}>
      <p className="text-[9px] text-[#9A9A94] uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-[#3E3D38] text-xs font-medium flex items-center gap-1.5">
        {icon && <span className="text-[#9A9A94]">{icon}</span>} {value}
      </p>
    </div>
  );
}
