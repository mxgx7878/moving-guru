// Universal page header used by every top-level page in the app.
// Shape is card + icon badge + eyebrow + title + description, with a
// right-side `actions` slot for page-level buttons (e.g. "New User").
//
// Every visible text element is optional, so the same component covers:
//   - admin pages (icon + eyebrow + title + description + action button)
//   - portal pages (gradient banner, no eyebrow)
//   - simple pages (just title + subtitle)
//
// Pass `variant="gradient"` and `gradientFrom`/`gradientTo` to render the
// instructor-portal style banner. Default variant is the white bordered
// card that the admin pages use.
export default function PageHeader({
  // Icon block (left side)
  icon: Icon,
  iconBg = '#E5E0D8',   // tint of the icon square background
  iconColor = '#3E3D38',

  // Text block
  eyebrow,              // tiny uppercase label above the title
  eyebrowColor,         // overrides the default #9A9A94 — usually matches the icon colour
  title,
  description,

  // Right-side slot for buttons, stat chips, etc.
  actions,

  // Visual variant
  variant = 'card',     // 'card' | 'gradient'
  gradientFrom,
  gradientTo,
  gradientAccent,       // colour for the subtle radial spotlight (gradient only)

  className = '',
  children,             // optional extra content below the header row
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
        <div className="relative z-10 flex-1 min-w-0">
          <HeaderText
            eyebrow={eyebrow}
            eyebrowColor={eyebrowColor}
            title={title}
            description={description}
          />
          {children}
        </div>
        {actions && <div className="relative z-10 flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    );
  }

  // Default "card" variant (admin look)
  return (
    <div className={`bg-white border border-[#E5E0D8] ${base} ${className}`}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
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
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
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
        <h1 className="font-['Unbounded'] text-xl lg:text-2xl font-black text-[#3E3D38] leading-tight">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-[#6B6B66] text-xs sm:text-sm mt-1 max-w-2xl">{description}</p>
      )}
    </div>
  );
}
