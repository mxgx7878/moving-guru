import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Single reusable text input used across every form.
//
// Error contract
// ──────────────────────────────────────────────────────────────
// Parent provides the error in ONE of two ways — never mix both:
//   • `error`            — string already resolved for THIS field.
//                          `<Input name="email" error={formErrors.email} />`
//   • `errors` + `name`  — map keyed by field name; component looks up
//                          `errors[name]`. Useful with RHF's
//                          `formState.errors` bag.
// If both are supplied `error` wins.
//
// Styling
// ──────────────────────────────────────────────────────────────
// Focus state is driven entirely by Tailwind `focus:` variants — we
// don't mutate style.borderColor on focus/blur. The accent colour is
// exposed as a CSS custom property so callers can still theme the ring.
export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  form,
  update,
  error,
  errors,
  rows = 4,
  maxLength,
  disabled = false,
  textarea = false,
  hint,
  iconLeft,
  accent = '#CE4F56',
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const currentValue = form ? (form[name] ?? '') : (value ?? '');
  const handleChange = (e) => {
    const v = e.target.value;
    if (update) update(name, v);
    if (onChange) onChange(e);
  };

  const fieldError = error ?? (errors && name ? errors[name] : undefined);

  const baseCls = [
    'w-full bg-warm-bg border rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-faint',
    'focus:outline-none focus:border-[var(--focus)] transition-all',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    fieldError ? 'border-red-400 focus:border-red-500' : 'border-edge',
    iconLeft ? 'pl-10' : '',
    isPassword ? 'pr-10' : '',
  ].filter(Boolean).join(' ');

  // Expose the accent through a CSS variable so the `focus:border-[var(--focus)]`
  // arbitrary class can pick it up — no runtime style mutation needed.
  const styleVars = { '--focus': accent };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-[10px] font-bold text-ink-soft tracking-widest uppercase mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none">
            {iconLeft}
          </span>
        )}

        {textarea ? (
          <textarea
            id={name}
            name={name}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? `${name}-err` : undefined}
            className={`${baseCls} resize-none`}
            style={styleVars}
            {...rest}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={inputType}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? `${name}-err` : undefined}
            className={baseCls}
            style={styleVars}
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink-muted"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        {fieldError
          ? <p id={`${name}-err`} className="text-red-500 text-xs">{fieldError}</p>
          : hint ? <p className="text-[10px] text-ink-soft">{hint}</p> : <span />}
        {maxLength && textarea && (
          <p className="text-[10px] text-ink-soft">{(currentValue || '').length}/{maxLength}</p>
        )}
      </div>
    </div>
  );
}
