import { X } from 'lucide-react';
import SearchBar from './SearchBar';
import FilterSelect from './FilterSelect';

export default function Toolbar({
  search,
  filters = [],
  advanced,
  resultCount,
  resultNoun = 'result',
  onClear,
  hasActiveFilters,
  className = '',
  children,
}) {
  const showFooter = typeof resultCount === 'number' &&
    (hasActiveFilters ?? !!onClear);

  return (
    <div className={`bg-white rounded-2xl border border-[#E5E0D8] p-4 space-y-3 ${className}`}>
      <div className="flex gap-3 flex-wrap items-center">
        {search && (
          <SearchBar
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder || 'Search...'}
            autoFocus={search.autoFocus}
          />
        )}

        {filters.map((f, i) => (
          f.render
            ? <div key={f.id || i}>{f.render()}</div>
            : (
              <FilterSelect
                key={f.id || i}
                value={f.value}
                onChange={f.onChange}
                options={f.options}
                icon={f.icon}
              />
            )
        ))}

        {children}

        {advanced && (
          <button
            type="button"
            onClick={advanced.onToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
              ${advanced.open || advanced.hasActive
                ? 'text-white'
                : 'bg-white border-[#E5E0D8] text-[#6B6B66] hover:border-[#3E3D38]'}`}
            style={(advanced.open || advanced.hasActive) && advanced.accent
              ? { backgroundColor: advanced.accent, borderColor: advanced.accent }
              : undefined}
          >
            {advanced.toggleLabel || 'Filters'}
          </button>
        )}
      </div>

      {advanced?.open && advanced.children && (
        <div className="pt-2 border-t border-[#E5E0D8]">
          {advanced.children}
        </div>
      )}

      {showFooter && (
        <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
          <p className="text-[#9A9A94] text-xs">
            {resultCount} {resultNoun}{resultCount !== 1 ? 's' : ''} found
          </p>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-coral hover:underline flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
