export default function Spinner({ size = 24, className = '', label = 'Loading' }) {
  return <span role="status" aria-label={label} className={`inline-flex text-brand-ink ${className}`}>
    <span className="inline-block rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none"
      style={{ width: size, height: size }} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>;
}
