import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SKELETON_PROPS } from '../../constants/theme';

export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D8]">
        <Skeleton width={160} height={14} {...SKELETON_PROPS} />
      </div>
      <div className="divide-y divide-[#E5E0D8]/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            <Skeleton circle width={32} height={32} {...SKELETON_PROPS} />
            <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols - 1}, 1fr)` }}>
              {Array.from({ length: cols - 1 }).map((_, c) => (
                <Skeleton key={c} height={12} {...SKELETON_PROPS} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
