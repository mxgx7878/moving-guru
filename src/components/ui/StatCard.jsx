import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'default', trend }) {
  const bgMap = {
    coral: 'bg-[#CE4F56]/10',
    orange: 'bg-[#E89560]/10',
    default: 'bg-[#FBF8E4]',
  };
  const iconMap = {
    coral: 'text-[#CE4F56]',
    orange: 'text-[#E89560]',
    default: 'text-[#6B6B66]',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8]">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgMap[color] || bgMap.default}`}>
          <Icon size={16} className={iconMap[color] || iconMap.default} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={9} /> +{trend}%
          </span>
        )}
      </div>
      <p className="font-unbounded text-2xl font-black text-[#3E3D38] mb-1">{value}</p>
      <p className="text-xs font-semibold text-[#6B6B66]">{label}</p>
      {sub && <p className="text-[10px] text-[#9A9A94] mt-0.5">{sub}</p>}
    </div>
  );
}
