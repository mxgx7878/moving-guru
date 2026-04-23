// Horizontal tab bar used for role / type / status filters across pages.
//
// tabs: [{ id, label, icon?, color?, activeText?, count? }]
// counts: optional map keyed by tab id (merges with tab.count)
//
// variant:
//   'default' — pill with rounded-xl, bold text, icon + right-side count
//               badge. Active tab uses tab.color as solid background.
//               (Admin pages, studio job-type filter, form-style pickers.)
//   'pill'    — rounded-full, cream inactive bg, inline "(count)" in the
//               label. Active tab uses tab.color as bg and tab.activeText
//               as text colour (supports bright accents like lime).
//
// layout:
//   'wrap'    — default; flex-wrap row
//   'stretch' — equal-width tabs (`flex-1`) for form-like type pickers.
//
// inactiveBg: Tailwind class override for the inactive background
//             (defaults differ per variant). Lets a page brand its
//             resting state without changing the variant.
//
// size: 'sm' (default) | 'md' — 'md' bumps vertical padding for form
//       usage where the tab sits in a field.
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
    ? 'bg-[#FBF8E4] text-[#6B6B66] hover:bg-[#E6FF80]'
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

        // Active state paints the tab with tab.color for both bg and
        // (in the default variant) border so the tab reads as solid.
        const activeStyle = active && t.color
          ? {
              backgroundColor: t.color,
              borderColor:     t.color,
              color:           t.activeText || (isPill ? '#3E3D38' : '#fff'),
            }
          : undefined;

        const activeCls = active
          ? (isPill ? 'shadow-sm' : 'text-white bg-[#2da4d6] border-transparent')
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
