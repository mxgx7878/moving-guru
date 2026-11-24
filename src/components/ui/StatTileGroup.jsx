import { CardSkeleton } from '../feedback';
export default function StatTileGroup({ tiles, columns = 4, className = '', loading = false }) {
  const gridColumns = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };
  if (loading) return <div className={`grid grid-cols-2 ${gridColumns[columns] || gridColumns[4]} gap-4 ${className}`}>{tiles.map(t => <CardSkeleton key={t.label} count={1} />)}</div>;
  return (
    <div className={`grid md:gap-4 gap-2  grid-cols-2 ${gridColumns[columns] || gridColumns[4]} ${className}`}>
      {tiles.map((t) => {
        const content = (
          <>
            <p className={`font-unbounded text-2xl font-black ${t.active ? 'text-black' : (t.color || 'text-[#3E3D38]')}`}>
              {t.value ?? '—'}
            </p>
            <p className="text-black text-xs mt-1 font-semibold">{t.label}</p>
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
            style={t.active
              ? { borderColor: '#B4FF5A', backgroundColor: '#B4FF5A', color: '#000000' }
              : undefined}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
