import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Matches AdminDashboard layout exactly:
// - header row (title block + signups-today stat)
// - 6 stat tiles in a 1/2/3-column grid
// - 4 activity cards in a 1/2-column grid, each with header + 5 rows
//
// Using the same baseColor / highlightColor palette as the other skeletons
// so the app has one consistent shimmer.
const BASE      = '#EDE8DF';
const HIGHLIGHT = '#F4F0EA';

export default function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[240px]">
          <Skeleton width={130} height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
          <div className="mt-2">
            <Skeleton width={280} height={24} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
          <div className="mt-2">
            <Skeleton width={360} height={12} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right space-y-1">
            <Skeleton width={90}  height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
            <Skeleton width={60}  height={24} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
          <Skeleton circle width={48} height={48} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </div>
      </div>

      {/* ── Stat tiles ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-start justify-between mb-4">
              <Skeleton width={40} height={40} borderRadius={12}
                baseColor={BASE} highlightColor={HIGHLIGHT} />
              <Skeleton width={48} height={16} borderRadius={999}
                baseColor={BASE} highlightColor={HIGHLIGHT} />
            </div>
            <Skeleton width={80} height={28}
              baseColor={BASE} highlightColor={HIGHLIGHT} />
            <div className="mt-2">
              <Skeleton width={100} height={12}
                baseColor={BASE} highlightColor={HIGHLIGHT} />
            </div>
            <div className="mt-1">
              <Skeleton width={120} height={10}
                baseColor={BASE} highlightColor={HIGHLIGHT} />
            </div>
            <div className="mt-3">
              <Skeleton width={50} height={10}
                baseColor={BASE} highlightColor={HIGHLIGHT} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Activity cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton width={36} height={36} borderRadius={12}
            baseColor={BASE} highlightColor={HIGHLIGHT} />
          <div className="flex-1 space-y-1">
            <Skeleton width={140} height={12} baseColor={BASE} highlightColor={HIGHLIGHT} />
            <Skeleton width={180} height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
        </div>
        <Skeleton width={60} height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
      </div>

      {/* 5 placeholder rows — matches `items.slice(0, 5)` in the real component */}
      <div className="divide-y divide-[#F0EBE3]">
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="px-5 py-3 flex items-center gap-3">
            <Skeleton circle width={32} height={32}
              baseColor={BASE} highlightColor={HIGHLIGHT} />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton width="70%" height={12} baseColor={BASE} highlightColor={HIGHLIGHT} />
              <Skeleton width="50%" height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
            </div>
            <Skeleton width={40} height={10} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
        ))}
      </div>
    </div>
  );
}