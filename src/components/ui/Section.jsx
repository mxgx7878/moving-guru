export default function Section({
  title,
  icon: Icon,
  iconColor = '#B4FF5A',
  padding = true,
  className = '',
  headerClassName = '',
  children,
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div className={`px-6 py-4 border-b border-[#E5E0D8] flex items-center gap-2 ${headerClassName}`}>
          {Icon && <Icon size={15} style={{ color: iconColor }} />}
          {title && (
            <h3 className="font-unbounded text-xs font-bold text-[#3E3D38] tracking-wider uppercase">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
}
