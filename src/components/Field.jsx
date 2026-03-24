export default function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#9A9A94] mt-1">{hint}</p>}
    </div>
  );
}
