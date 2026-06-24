import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { ProjectInputs, ProjectMetrics } from '../types';

interface Props {
  inputs: ProjectInputs;
  metrics: ProjectMetrics;
}

export function HoursControlChart({ inputs, metrics }: Props) {
  const data = [
    { name: 'Витрачено', value: inputs.actualHoursSpent, color: '#38c8ff' },
    { name: 'Залишок (прогноз)', value: inputs.estimatedRemainingHours, color: '#c5edab' },
    { name: 'Безпечний ліміт', value: Math.max(0, metrics.maxSafeHoursForTargetMargin), color: '#9fe870' },
    { name: 'Точка беззбитковості', value: Math.max(0, metrics.breakEvenHours), color: '#ffd11a' },
  ];

  const fmt = (val: number) => `${val.toFixed(1)} год`;

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Контроль годин</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" tickFormatter={(v) => `${v} год`} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(val) => fmt(Number(val))} />
          <ReferenceLine x={inputs.actualHoursSpent + inputs.estimatedRemainingHours} stroke="#0e0f0c" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Загалом: ${metrics.estimatedTotalHours} год`, position: 'top', fontSize: 11 }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
