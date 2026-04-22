// Uppercase-label + content wrapper used inside detail drawers and
// profile sections. Smaller/flatter than `Section` (which is a bordered
// card). Replaces the inline `Section({ label, children })` helpers that
// AdminUsers and AdminJobs each defined locally.
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
