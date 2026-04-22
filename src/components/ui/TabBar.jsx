// Horizontal pill-tab bar used for role / type / status filters on admin
// pages. `tabs` is [{ id, label, icon?, color?, count? }]. The active tab
// uses the tab's `color` as its background; pass `counts` keyed by tab id
// to show a count badge on each tab.
export default function TabBar({ tabs, activeId, onChange, counts, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = activeId === t.id;
        const count = counts ? counts[t.id] : t.count;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all
              ${active ? 'text-white border-transparent' : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
            style={active && t.color ? { backgroundColor: t.color } : {}}
          >
            {Icon && <Icon size={13} />} {t.label}
            {typeof count === 'number' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${active ? 'bg-white/25' : 'bg-[#F5F0E8]'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
