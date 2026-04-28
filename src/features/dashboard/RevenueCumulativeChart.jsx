import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * RevenueCumulativeChart
 * ─────────────────────────────────────────────────────────────
 * Lifetime running-total chart. Each point is "total revenue
 * earned through this month." Better story for "we've made $X
 * to date" than the per-month bars, which require mental addition.
 */
export default function RevenueCumulativeChart({ data = [], loading = false }) {
  if (loading) {
    return <div className="h-48 bg-[#F0EBE3] animate-pulse rounded-lg" />;
  }
  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[#9A9A94]">
        No revenue data yet
      </div>
    );
  }

  const lifetime = data[data.length - 1]?.cumulative || 0;

  return (
    <div className="space-y-2">
      <div className="h-44 w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7F77DD" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7F77DD" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
            <XAxis
              dataKey="month_short"
              tick={{ fontSize: 10, fill: '#9A9A94', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9A9A94' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#3E3D38',
                border: 'none',
                borderRadius: 8,
                fontSize: 11,
                padding: '6px 10px',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              itemStyle={{ color: '#7F77DD' }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Lifetime']}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#7F77DD"
              strokeWidth={2.5}
              fill="url(#cumGradient)"
              dot={{ fill: '#fff', stroke: '#7F77DD', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: '#7F77DD', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center pt-1">
        <span className="text-[10px] text-[#9A9A94] uppercase tracking-wider font-semibold">Lifetime · </span>
        <span className="font-unbounded text-sm font-black text-[#7F77DD]">
          ${Number(lifetime).toLocaleString()}
        </span>
      </div>
    </div>
  );
}