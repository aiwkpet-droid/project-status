import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ProjectInputs, ProjectMetrics } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

interface Props {
  inputs: ProjectInputs;
  metrics: ProjectMetrics;
}

const COLORS: Record<string, string> = {
  design: '#38c8ff',
  artDirection: '#9fe870',
  management: '#c5edab',
  development: '#ffc091',
  otherDirect: '#ffd11a',
  sales: '#868685',
  tax: '#b86700',
  buffer: '#e8ebe6',
  profit: '#2ead4b',
  loss: '#d03238',
};

export function BudgetBreakdownChart({ inputs, metrics }: Props) {
  const symbol = CURRENCY_SYMBOLS[inputs.currency];
  const isLoss = metrics.projectedProfit < 0;

  const items = [
    { name: 'Дизайн', value: metrics.projectedDesignCost, color: COLORS.design },
    { name: 'Артдирекшн', value: metrics.projectedArtDirectionCost, color: COLORS.artDirection },
    { name: 'Менеджмент / PM', value: metrics.projectedManagementCost, color: COLORS.management },
    { name: 'Розробка', value: inputs.developmentCost, color: COLORS.development },
    { name: 'Інші витрати', value: inputs.otherDirectCosts, color: COLORS.otherDirect },
    { name: 'Продаж', value: metrics.salesCost, color: COLORS.sales },
    { name: 'Податки', value: metrics.taxCost, color: COLORS.tax },
    { name: 'Резерв', value: metrics.bufferCost, color: COLORS.buffer },
    { name: isLoss ? 'Збиток' : 'Прибуток', value: Math.abs(metrics.projectedProfit), color: isLoss ? COLORS.loss : COLORS.profit },
  ];

  const data = items.filter(d => d.value > 0);

  const fmt = (val: number) =>
    `${symbol}${val.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}`;

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Структура бюджету</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44 + 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(val) => fmt(Number(val))} />
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
