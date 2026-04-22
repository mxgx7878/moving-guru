import { ChevronDown } from 'lucide-react';

// Styled <select> matching the app's Input look. Consolidates the
// SelectField / SelectInput helpers that were defined inline on
// ProfilePage and Register. `options` accepts plain strings or
// { value, label } objects so both form shapes keep working.
export default function SelectField({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label,
  error,
  accent = '#CE4F56',
  size = 'md',
  disabled = false,
  className = '',
}) {
  const padding = size === 'sm'
    ? 'px-3 py-2.5 pr-9'
    : 'px-4 py-3 pr-10';

  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none border rounded-xl text-sm bg-white focus:outline-none transition-colors disabled:opacity-60
            ${padding}
            ${error ? 'border-red-400' : 'border-[#E5E0D8]'}
            ${!value ? 'text-[#C4BCB4]' : 'text-[#3E3D38]'}`}
          onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
          onBlur={(e) => (e.currentTarget.style.borderColor = '')}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value;
            const label = typeof o === 'string' ? o : o.label;
            return <option key={value} value={value}>{label}</option>;
          })}
        </select>
        <ChevronDown
          size={14}
          className={`absolute ${size === 'sm' ? 'right-3' : 'right-4'} top-1/2 -translate-y-1/2 text-[#9A9A94] pointer-events-none`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
