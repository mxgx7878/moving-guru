export default function StatTileGroup({ tiles, columns = 4, className = '' }) {
  return (
    <div className={`grid md:gap-4 gap-2  grid-cols-2 md:grid-cols-${columns} ${className}`}>
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
