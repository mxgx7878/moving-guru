import { Zap } from 'lucide-react';

export default function EnergyExchangeBadge({ open, className = '' }) {
  if (!open) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] text-[#6B6B66] ${className}`}
    >
      <Zap size={10} className="text-[#B4FF5A]" />
      Open to energy exchange options
    </span>
  );
}
