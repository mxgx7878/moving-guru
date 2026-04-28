import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function MonthlyViewsChart({ data = [], loading = false, accent = '#CE4F56' }) {
  if (loading) return <div className="h-48 bg-[#F0EBE3] animate-pulse rounded-lg" />;
  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[#9A9A94]">
        No view data yet
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
          <XAxis dataKey="month_short"
            tick={{ fontSize: 10, fill: '#9A9A94', fontWeight: 600 }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9A9A94' }}
            axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#3E3D38', border: 'none', borderRadius: 8,
              fontSize: 11, padding: '6px 10px',
            }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            itemStyle={{ color: accent }}
            formatter={(v) => [v, 'Views']}
          />
          <Area type="monotone" dataKey="views" stroke={accent} strokeWidth={2.5}
            fill="url(#viewsGrad)"
            dot={{ fill: '#fff', stroke: accent, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6, fill: accent, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}