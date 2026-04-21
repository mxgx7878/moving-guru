import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Single reusable text input used across every form. Supports:
//  - password show/hide
//  - textarea mode via `textarea` prop
//  - both controlled (`value` + `onChange`) and form-aware (`form` + `update`) styles
// Forms can hand over `errors` keyed by field name, or pass a plain `error` string.
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

  const fieldError = error || (errors && errors[name]);

  const baseCls = `w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
    fieldError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8]'
  } ${iconLeft ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`;

  const focusStyle = { '--tw-ring-color': accent };

  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none">
            {iconLeft}
          </span>
        )}

        {textarea ? (
          <textarea
            name={name}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            className={`${baseCls} resize-none`}
            style={focusStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = fieldError ? '' : '')}
            {...rest}
          />
        ) : (
          <input
            name={name}
            type={inputType}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={baseCls}
            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        {fieldError
          ? <p className="text-red-500 text-xs">{fieldError}</p>
          : hint ? <p className="text-[10px] text-[#9A9A94]">{hint}</p> : <span />}
        {maxLength && textarea && (
          <p className="text-[10px] text-[#9A9A94]">{(currentValue || '').length}/{maxLength}</p>
        )}
      </div>
    </div>
  );
}
