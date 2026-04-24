// Numeric KPI strip used at the top of listing/dashboard pages
// (JobListings, FindWork, Grow, etc). Pass an array of tiles — each
// renders as a bordered card with a big value and a caption.
//
// Each tile: { label, value, color?, onClick?, active? }
//   - color:  Tailwind class for the value ("text-[#2DA4D6]")
//   - onClick: makes the tile interactive (toggle active filter, etc.)
//   - active:  currently-selected state
//
// Distinct from StatCard (dashboard card with icon + trend) and StatTile
// (small drawer tile with cream background).
export default function StatTileGroup({ tiles, columns = 4, className = '' }) {
  return (
    <div className={`grid gap-4 grid-cols-${columns} ${className}`}>
      {tiles.map((t) => {
        const content = (
          <>
            <p className={`font-unbounded text-2xl font-black ${t.color || 'text-[#3E3D38]'}`}>
              {t.value ?? '—'}
            </p>
            <p className="text-[#9A9A94] text-xs mt-1 font-semibold">{t.label}</p>
          </>
        );

        const base = 'rounded-2xl p-4 border text-center transition-all';
        const resting = 'bg-white border-[#E5E0D8]';
        const activeCls = 'border-2 shadow-sm';

        if (!t.onClick) {
          return (
            <div key={t.label} className={`${base} ${resting}`}>
              {content}
            </div>
          );
        }

        return (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            className={`${base} ${t.active ? activeCls : resting} hover:shadow-sm`}
            style={t.active && t.color
              ? { borderColor: t.color, backgroundColor: `${t.color}18` }
              : undefined}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
