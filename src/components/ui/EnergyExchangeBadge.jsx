import { Zap } from 'lucide-react';

/**
 * EnergyExchangeBadge
 * ─────────────────────────────────────────────────────────────
 * Small subtle badge shown on profiles and job posts when the
 * user / listing is open to energy-exchange arrangements.
 *
 * Per client direction this is intentionally low-emphasis (small
 * text, single icon, neutral colour) — energy exchange is a
 * fallback option, not a headline feature.
 *
 * Renders nothing when `open` is false, so callers can drop it
 * inline without a wrapping conditional.
 */
export default function EnergyExchangeBadge({ open, className = '' }) {
  if (!open) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] text-[#6B6B66] ${className}`}
    >
      <Zap size={10} className="text-[#6BE6A4]" />
      Open to energy exchange options
    </span>
  );
}