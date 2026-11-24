export default function LabeledBlock({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold text-ink-muted tracking-widest uppercase mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
