export default function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-2">
        <Icon size={15} className="text-[#CE4F56]" />
        <h3 className="font-['Unbounded'] text-xs font-bold text-[#3E3D38] tracking-wider uppercase">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
