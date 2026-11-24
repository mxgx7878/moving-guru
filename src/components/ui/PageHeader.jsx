/** Shared dashboard-style overview for every portal page. */
export default function PageHeader({ eyebrow, title, description, actions, className = '', children }) {
  return (
    <div className={`rounded-2xl border border-edge p-5 sm:p-6 flex items-start justify-between gap-4 flex-wrap relative overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FDA6 100%)' }}>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-brand-ink text-xs font-semibold tracking-widest uppercase mb-1">{eyebrow}</p>}
        {title && <h1 className="font-unbounded text-xl lg:text-2xl font-black text-ink leading-tight">{title}</h1>}
        {description && <p className="text-ink-muted text-xs sm:text-sm mt-1 max-w-2xl">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
