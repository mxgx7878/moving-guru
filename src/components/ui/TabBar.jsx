export default function TabBar({
  tabs,
  activeId,
  onChange,
  counts,
  variant = 'default',
  layout = 'wrap',
  size = 'sm',
  inactiveBg,
  className = '',
}) {
  const isPill    = variant === 'pill';
  const isStretch = layout === 'stretch';

  const verticalPad = size === 'md' ? 'py-2.5' : 'py-2';

  const resting = inactiveBg || (isPill
    ? 'bg-[#FAFEE0] text-[#6B6B66] hover:bg-[#DBFFA9]'
    : 'bg-white border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]');

  const base = isPill
    ? `px-4 ${verticalPad} rounded-full text-xs font-semibold transition-all`
    : `flex items-center gap-2 ${isStretch ? 'justify-center flex-1' : ''} px-4 ${verticalPad} rounded-xl text-xs font-bold border transition-all`;

  const containerCls = isStretch ? 'flex gap-2' : 'flex flex-wrap gap-2';

  return (
    <div className={`${containerCls} ${className}`}>
      {tabs.map((t) => {
        const Icon   = t.icon;
        const active = activeId === t.id;
        const count  = counts ? counts[t.id] : t.count;

        const activeStyle = active && t.color
          ? {
              backgroundColor: t.color,
              borderColor:     t.color,
              color:           t.activeText || (isPill ? '#3E3D38' : 'black'),
            }
          : undefined;

        const activeCls = active
          ? (isPill ? 'shadow-sm' : 'text-white bg-coral border-transparent')
          : resting;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`${base} ${activeCls}`}
            style={activeStyle}
          >
            {Icon && <Icon size={13} className={isPill ? 'inline -mt-0.5 mr-1.5' : ''} />}
            {t.label}
            {typeof count === 'number' && (
              isPill
                ? <span className="ml-1.5 opacity-70">({count})</span>
                : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1
                    ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                    {count}
                  </span>
                )
            )}
          </button>
        );
      })}
    </div>
  );
}
