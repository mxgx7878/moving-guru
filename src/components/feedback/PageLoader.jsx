import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PageLoader() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
        <Skeleton width={200} height={20} baseColor="#EDE8DF" highlightColor="#F4F0EA" />
        <Skeleton width={300} height={12} baseColor="#EDE8DF" highlightColor="#F4F0EA" className="mt-2" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
            <Skeleton circle width={36} height={36} baseColor="#EDE8DF" highlightColor="#F4F0EA" />
            <Skeleton width={60} height={24} baseColor="#EDE8DF" highlightColor="#F4F0EA" className="mt-3" />
            <Skeleton width={90} height={10} baseColor="#EDE8DF" highlightColor="#F4F0EA" className="mt-2" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
        <Skeleton count={5} baseColor="#EDE8DF" highlightColor="#F4F0EA" className="mb-2" />
      </div>
    </div>
  );
}
