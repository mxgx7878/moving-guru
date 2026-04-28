import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function ApplicationStatusChart({ data = [], loading = false }) {
  if (loading) return <div className="h-48 bg-[#F0EBE3] animate-pulse rounded-lg" />;

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[#9A9A94]">
        No applications yet
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name"
            cx="50%" cy="50%" innerRadius={42} outerRadius={70}
            paddingAngle={2}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#3E3D38', border: 'none', borderRadius: 8,
              fontSize: 11, padding: '6px 10px',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(v, name) => [v, name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}