import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

/**
 * RevenueChart
 * ─────────────────────────────────────────────────────────────
 * Bar chart of monthly revenue. Latest month is emphasised with
 * a fully-saturated green fill; prior months are tinted lighter
 * so the eye lands on "current month performance" first.
 */
export default function RevenueChart({ data = [], loading = false }) {
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

  const lastIdx = data.length - 1;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
          <XAxis
            dataKey="month_short"
            tick={{ fontSize: 10, fill: '#9A9A94', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9A9A94' }}
            tickFormatter={(v) => `$${v}`}
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
            itemStyle={{ color: '#10B981' }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
            cursor={{ fill: '#10B98115' }}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === lastIdx ? '#10B981' : '#10B98155'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}