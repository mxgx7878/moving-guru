import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'black', trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center`}
          style={{ background: color === 'lime' ? '#d4f53c' : color === 'orange' ? '#e8834a20' : '#f0f0ec' }}>
          <Icon size={16} className={color === 'lime' ? 'text-black' : color === 'orange' ? 'text-[#e8834a]' : 'text-black/50'} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={9} /> +{trend}%
          </span>
        )}
      </div>
      <p className="font-['Unbounded'] text-2xl font-black text-black mb-1">{value}</p>
      <p className="text-xs font-semibold text-black/60">{label}</p>
      {sub && <p className="text-[10px] text-black/30 mt-0.5">{sub}</p>}
    </div>
  );
}
