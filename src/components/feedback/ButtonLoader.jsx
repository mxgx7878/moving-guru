export default function ButtonLoader({ size = 16 }) {
  return <span role="status" aria-label="Loading" className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    style={{ width: size, height: size }} />;
}
