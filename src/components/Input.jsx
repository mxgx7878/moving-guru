const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  form,
  update,
  errors,
}) => {
  return (
    <div>
      <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
        {label}
      </label>

      <input
        type={type}
        value={form[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all bg-white
      ${errors[name] ? "border-red-400" : "border-[#E5E0D8]"}`}
      />

      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
};

export default Input;
