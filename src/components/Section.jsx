export default function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
      <div className="px-6 py-4 border-b border-black/6 flex items-center gap-2">
        <Icon size={15} className="text-black/40" />
        <h3 className="font-['Unbounded'] text-xs font-bold text-black tracking-wider uppercase">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
