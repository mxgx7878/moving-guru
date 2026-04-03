import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  form,
  update,
  errors,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-[#9A9A94] text-xs font-semibold tracking-wider uppercase mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={inputType}
          value={form[name] || ""}
          onChange={(e) => update(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#CE4F56] transition-all bg-white
        ${isPassword ? 'pr-10' : ''}
        ${errors[name] ? "border-red-400" : "border-[#E5E0D8]"}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A94] hover:text-[#6B6B66]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );
};

export default Input;
