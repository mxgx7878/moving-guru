import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

/**
 * UserGrowthChart
 * ─────────────────────────────────────────────────────────────
 * Stacked-bar comparison of new instructor vs studio signups
 * over the last 6 months. Sourced from the existing stats
 * endpoint's `signups_by_month` field (added in this round).
 */
export default function UserGrowthChart({ data = [], loading = false }) {
  if (loading) {
    return <div className="h-48 bg-[#F0EBE3] animate-pulse rounded-lg" />;
  }
  if (!data?.length) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[#9A9A94]">
        No signup data yet
      </div>
    );
  }

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
            axisLine={false}
            tickLine={false}
            width={30}
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
            cursor={{ fill: '#7F77DD15' }}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, paddingBottom: 8 }}
          />
          <Bar dataKey="instructors" stackId="a" fill="#CE4F56" radius={[0, 0, 0, 0]} />
          <Bar dataKey="studios"     stackId="a" fill="#2DA4D6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}