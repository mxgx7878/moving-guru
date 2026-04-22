import { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Dashed-border file upload zone used for avatars, cover images and
// gallery uploads across profile/register pages. Click-to-open file
// picker; pass `preview` to render the selected image, or `children`
// to render your own preview.
export default function FileDropzone({
  onFiles,
  accept = 'image/*',
  multiple = false,
  preview,
  height = 'h-32',
  icon: Icon = ImageIcon,
  label = 'Click to upload',
  accent = '#CE4F56',
  children,
  className = '',
  disabled = false,
}) {
  const ref = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    onFiles?.(multiple ? files : files[0]);
    e.target.value = '';
  };

  const borderHover = `hover:border-[${accent}]`;

  return (
    <div
      onClick={() => !disabled && ref.current?.click()}
      className={`w-full ${height} border-2 border-dashed border-[#E5E0D8] rounded-xl overflow-hidden relative bg-[#FDFCF8] transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${borderHover}`
      } ${className}`}
      style={{ '--accent': accent }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      {children ?? (
        preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Icon size={22} className="text-[#3E3D38]/20" />
            <p className="text-[10px] text-[#3E3D38]/40 mt-1 font-medium">{label}</p>
          </div>
        )
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
