export default function PageHeader({
  icon: Icon,
  iconBg = '#E5E0D8',
  iconColor = '#3E3D38',

  eyebrow,
  eyebrowColor,
  title,
  description,

  actions,

  variant = 'card',
  gradientFrom,
  gradientTo,
  gradientAccent,

  className = '',
  children,
}) {
  const base = 'rounded-2xl p-6 flex items-start justify-between gap-4 flex-wrap relative overflow-hidden';

  if (variant === 'gradient') {
    return (
      <div
        className={`${base} border border-[#E5E0D8] ${className}`}
        style={{
          background: gradientFrom && gradientTo
            ? `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
            : undefined,
        }}
      >
        {gradientAccent && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: `radial-gradient(circle at 85% 50%, ${gradientAccent} 0%, transparent 60%)` }}
          />
        )}
        <div className="relative z-10 md:flex-1 min-w-0">
          <HeaderText
            eyebrow={eyebrow}
            eyebrowColor={eyebrowColor}
            title={title}
            description={description}
          />
          {children}
        </div>
        {actions && <div className="relative z-10 flex items-center gap-2 flex-wrap md:max-w-max w-full">{actions}</div>}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-[#E5E0D8] ${base} ${className}`}>
      <div className="flex items-center gap-4 min-w-0 md:flex-1">
        {Icon && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconBg}` }}
          >
            <Icon size={22} style={{ color: iconColor }} />
          </div>
        )}
        <HeaderText
          eyebrow={eyebrow}
          eyebrowColor={eyebrowColor}
          title={title}
          description={description}
        />
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap md:max-w-max w-full">{actions}</div>}
      {children}
    </div>
  );
}

function HeaderText({ eyebrow, eyebrowColor, title, description }) {
  return (
    <div className="min-w-0">
      {eyebrow && (
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: eyebrowColor || '#9A9A94' }}
        >
          {eyebrow}
        </p>
      )}
      {title && (
        <h1 className="font-unbounded text-xl lg:text-2xl font-black text-[#3E3D38] leading-tight">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-[#6B6B66] text-xs sm:text-sm mt-1 max-w-2xl">{description}</p>
      )}
    </div>
  );
}
