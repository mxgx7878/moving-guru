import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E0D8]">
        <Skeleton width={160} height={14} baseColor="#EDE8DF" highlightColor="#F4F0EA" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-[#E5E0D8]/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            <Skeleton circle width={32} height={32} baseColor="#EDE8DF" highlightColor="#F4F0EA" />
            <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols - 1}, 1fr)` }}>
              {Array.from({ length: cols - 1 }).map((_, c) => (
                <Skeleton key={c} height={12} baseColor="#EDE8DF" highlightColor="#F4F0EA" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
