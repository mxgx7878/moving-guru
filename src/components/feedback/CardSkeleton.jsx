import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { SKELETON_PROPS } from '../../constants/theme';

export default function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
          <Skeleton circle width={36} height={36} {...SKELETON_PROPS} className="mb-4" />
          <Skeleton width={80} height={24} {...SKELETON_PROPS} className="mb-2" />
          <Skeleton width={100} height={12} {...SKELETON_PROPS} />
        </div>
      ))}
    </div>
  );
}
