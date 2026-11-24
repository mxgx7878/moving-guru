export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div className={`py-16 text-center ${className}`}>
      {Icon && <Icon size={36} className="mx-auto text-ink-muted mb-3" />}
      {title && (
        <p className="font-unbounded text-sm font-bold text-[#3E3D38]">{title}</p>
      )}
      {message && (
        <p className="text-ink-muted text-xs mt-1">{message}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
