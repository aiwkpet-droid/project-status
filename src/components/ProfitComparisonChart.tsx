import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { ProjectMetrics, Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

interface Props {
  metrics: ProjectMetrics;
  currency: Currency;
}

export function ProfitComparisonChart({ metrics, currency }: Props) {
  const symbol = CURRENCY_SYMBOLS[currency];

  const data = [
    {
      name: 'Поточний прибуток',
      value: metrics.currentProfit,
      color: metrics.currentProfit >= 0 ? '#2ead4b' : '#d03238',
    },
    {
      name: 'Прогнозований прибуток',
      value: metrics.projectedProfit,
      color: metrics.projectedProfit >= 0 ? '#9fe870' : '#d03238',
    },
  ];

  const fmt = (val: number) =>
    `${symbol}${val.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}`;

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Поточний vs прогнозований прибуток</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(val) => fmt(Number(val))} />
          <ReferenceLine x={0} stroke="#0e0f0c" strokeWidth={1} />
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
