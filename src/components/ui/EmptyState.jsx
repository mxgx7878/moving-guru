// Centered empty state block — icon + title + message. Optional `action`
// slot for a primary button beneath the message. Replaces every ad-hoc
// "No results" card across listing pages.
export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div className={`py-16 text-center ${className}`}>
      {Icon && <Icon size={36} className="mx-auto text-[#C4BCB4] mb-3" />}
      {title && (
        <p className="font-unbounded text-sm font-bold text-[#3E3D38]">{title}</p>
      )}
      {message && (
        <p className="text-[#9A9A94] text-xs mt-1">{message}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
