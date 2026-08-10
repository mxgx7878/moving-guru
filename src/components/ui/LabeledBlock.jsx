export default function LabeledBlock({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
