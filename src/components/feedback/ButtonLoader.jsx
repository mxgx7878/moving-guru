export default function ButtonLoader({ size = 16, color = 'white' }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: `${color}30`,
        borderTopColor: color,
      }}
    />
  );
}
