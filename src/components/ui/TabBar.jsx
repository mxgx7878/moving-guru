// Horizontal tab bar used for role / type / status filters across pages.
//
// tabs: [{ id, label, icon?, color?, activeText?, count? }]
// counts: optional map keyed by tab id (merges with tab.count)
//
// variant:
//   'default' — pill with rounded-xl, bold text, icon + right-side count
//               badge. Active tab uses tab.color as solid background.
//               (Admin pages, studio job-type filter.)
//   'pill'    — rounded-full, cream inactive bg, inline "(count)" in the
//               label. Active tab uses tab.color as bg and tab.activeText
//               as text colour (supports bright accents like lime).
//
// inactiveBg: Tailwind class override for the inactive background
//             (defaults differ per variant). Lets a page brand its
//             resting state without changing the variant.
export default function TabBar({
  tabs,
  activeId,
  onChange,
  counts,
  variant = 'default',
  inactiveBg,
  className = '',
}) {
  const isPill = variant === 'pill';

  const resting = inactiveBg || (isPill
    ? 'bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E6FF80]'
    : 'bg-white border border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]');

  const base = isPill
    ? 'px-4 py-2 rounded-full text-xs font-semibold transition-all'
    : 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((t) => {
        const Icon   = t.icon;
        const active = activeId === t.id;
        const count  = counts ? counts[t.id] : t.count;

        const activeStyle = active && t.color
          ? { backgroundColor: t.color, color: t.activeText || (isPill ? '#3E3D38' : '#fff') }
          : undefined;

        const activeCls = active
          ? (isPill ? 'shadow-sm' : 'text-white border-transparent')
          : resting;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`${base} ${activeCls}`}
            style={activeStyle}
          >
            {Icon && <Icon size={13} className="inline -mt-0.5 mr-1.5" />}
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
