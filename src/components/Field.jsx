export default function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-black/40 tracking-widest uppercase mb-2">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-black/25 mt-1">{hint}</p>}
    </div>
  );
}
