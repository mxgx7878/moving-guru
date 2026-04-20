const Toggle = ( { label, checked, onChange } ) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3 text-sm">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-14 h-6 bg-slate-300 rounded-full peer peer-checked:bg-[#2DA4D6] transition-colors duration-200"></div>
        <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-8"></span>
        {label}
    </label>
    );
};

export default Toggle;