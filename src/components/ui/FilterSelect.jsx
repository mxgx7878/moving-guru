import { Filter } from 'lucide-react';

// Filter dropdown that matches the SearchBar pill styling — used next to
// SearchBar on admin/listing pages. `options` is an array of { id, label }.
export default function FilterSelect({
  value,
  onChange,
  options,
  icon: Icon = Filter,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-3 py-2 ${className}`}>
      <Icon size={14} className="text-[#9A9A94]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm text-[#3E3D38] pr-2"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
