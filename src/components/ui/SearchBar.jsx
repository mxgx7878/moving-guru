import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
}) {
  return (
    <div className={`flex-1 flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl px-4 py-2.5 min-w-[220px] ${className}`}>
      <Search size={16} className="text-[#9A9A94] flex-shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} className="text-[#9A9A94] hover:text-[#3E3D38]" />
        </button>
      )}
    </div>
  );
}
