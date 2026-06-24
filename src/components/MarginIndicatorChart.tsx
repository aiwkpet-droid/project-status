import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { ProjectInputs, ProjectMetrics } from '../types';

interface Props {
  inputs: ProjectInputs;
  metrics: ProjectMetrics;
}

export function MarginIndicatorChart({ inputs, metrics }: Props) {
  const data = [
    {
      name: 'Поточна маржа',
      value: metrics.currentMarginPercent,
      color: metrics.currentMarginPercent >= inputs.targetMarginPercent
        ? '#2ead4b'
        : metrics.currentMarginPercent >= inputs.minimumMarginPercent
          ? '#ffd11a'
          : '#d03238',
    },
    {
      name: 'Прогнозована маржа',
      value: metrics.projectedMarginPercent,
      color: metrics.projectedMarginPercent >= inputs.targetMarginPercent
        ? '#9fe870'
        : metrics.projectedMarginPercent >= inputs.minimumMarginPercent
          ? '#ffd11a'
          : '#d03238',
    },
  ];

  const fmt = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Індикатор маржі</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <XAxis type="number" tickFormatter={fmt} domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(val) => fmt(Number(val))} />
          <ReferenceLine
            x={inputs.targetMarginPercent}
            stroke="#2ead4b"
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{ value: `Ціль: ${inputs.targetMarginPercent}%`, position: 'top', fontSize: 11, fill: '#2ead4b' }}
          />
          <ReferenceLine
            x={inputs.minimumMarginPercent}
            stroke="#d03238"
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{ value: `Мін: ${inputs.minimumMarginPercent}%`, position: 'bottom', fontSize: 11, fill: '#d03238' }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
