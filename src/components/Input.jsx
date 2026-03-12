const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  form,
  update,
  errors,
}) => {
    console.log(form)
    console.log(name)
  return (
    <div>
      <label className="block text-black/50 text-xs font-semibold tracking-wider uppercase mb-2">
        {label}
      </label>

      <input
        type={type}
        value={form[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-black placeholder-black/30 focus:outline-none focus:border-black/40 transition-all bg-white
      ${errors[name] ? "border-red-400" : "border-black/15"}`}
      />

      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
};

export default Input;
