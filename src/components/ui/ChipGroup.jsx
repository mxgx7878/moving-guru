import ToggleChip from './ToggleChip';

/**
 * ChipGroup
 * ─────────────────────────────────────────────────────────────
 * Declarative multi- or single-select chip row. Handles the common
 * "render an array of options, track which ones are selected,
 * toggle on click" pattern so callers don't re-implement it.
 *
 * Example — single-select:
 *   <ChipGroup
 *     options={POSITION_TYPES}
 *     getValue={(o) => o.id}
 *     getLabel={(o) => o.label}
 *     value={form.hiringPositionType}
 *     onChange={(id) => update('hiringPositionType', id)}
 *     tone="blue"
 *   />
 *
 * Example — multi-select:
 *   <ChipGroup
 *     options={LANGUAGES}
 *     value={form.languages}
 *     onChange={(next) => update('languages', next)}
 *     multiple
 *     tone="blue"
 *   />
 *
 * Options may be plain strings OR `{ id, label, ...}` objects —
 * `getValue`/`getLabel` default to identity / stringify so strings
 * just work.
 */
export default function ChipGroup({
  options = [],
  value,
  onChange,
  multiple = false,
  getValue = (o) => (typeof o === 'object' ? o.id : o),
  getLabel = (o) => (typeof o === 'object' ? o.label : String(o)),
  tone = 'blue',
  size = 'lg',
  className = '',
  disabled = false,
}) {
  const isActive = (val) => (multiple
    ? Array.isArray(value) && value.includes(val)
    : value === val);

  const handleClick = (val) => {
    if (disabled) return;
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      onChange?.(next);
    } else {
      onChange?.(val);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const val = getValue(opt);
        return (
          <ToggleChip
            key={String(val)}
            active={isActive(val)}
            onClick={() => handleClick(val)}
            tone={tone}
            size={size}
            disabled={disabled}
          >
            {getLabel(opt)}
          </ToggleChip>
        );
      })}
    </div>
  );
}
