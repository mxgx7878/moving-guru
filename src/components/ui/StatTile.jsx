// Compact stat tile used inside detail drawers — small bordered card
// with a big value and a caption. Different from StatCard which is the
// larger dashboard-style card with an icon.
export default function StatTile({ label, value, icon: Icon, className = '' }) {
  return (
    <div className={`bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl p-3 ${Icon ? '' : 'text-center'} ${className}`}>
      {Icon ? (
        <>
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1">
            <Icon size={10} /> {label}
          </p>
          <p className="font-unbounded text-sm font-black text-[#3E3D38] truncate">{value ?? '—'}</p>
        </>
      ) : (
        <>
          <p className="font-unbounded text-base font-black text-[#3E3D38]">{value ?? '—'}</p>
          <p className="text-[10px] font-semibold text-[#9A9A94]">{label}</p>
        </>
      )}
    </div>
  );
}
