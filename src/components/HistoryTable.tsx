import type { ProjectHistoryRecord, Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { StatusBadge } from './StatusBadge';

interface HistoryTableProps {
  records: ProjectHistoryRecord[];
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmt(val: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency];
  return `${sym}${val.toLocaleString('uk-UA', { maximumFractionDigits: 2 })}`;
}

export function HistoryTable({ records, onDelete }: HistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="history-empty">
        <p className="history-empty__text">
          Історія поки порожня. Збережіть перший розрахунок, щоб почати відстежувати фінансову динаміку проєкту.
        </p>
      </div>
    );
  }

  return (
    <div className="history-table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Коментар</th>
            <th>Загальний бюджет</th>
            <th>Витрачено, год</th>
            <th>Прогноз, год</th>
            <th>Прогн. прибуток</th>
            <th>Прогн. маржа</th>
            <th>Безпечні год</th>
            <th>Статус</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const currency = record.inputs.currency as Currency;
            return (
              <tr key={record.id}>
                <td className="history-table__date">{formatDate(record.createdAt)}</td>
                <td className="history-table__note">{record.note || '—'}</td>
                <td>{fmt(record.metrics.totalProjectBudget, currency)}</td>
                <td>{record.inputs.actualHoursSpent}</td>
                <td>{record.inputs.estimatedRemainingHours}</td>
                <td className={record.metrics.projectedProfit < 0 ? 'history-table__negative' : ''}>
                  {fmt(record.metrics.projectedProfit, currency)}
                </td>
                <td className={record.metrics.projectedProfit < 0 ? 'history-table__negative' : ''}>
                  {record.metrics.projectedMarginPercent.toFixed(1)}%
                </td>
                <td className={record.metrics.remainingSafeHours < 0 ? 'history-table__negative' : ''}>
                  {record.metrics.remainingSafeHours.toFixed(1)}
                </td>
                <td>
                  <StatusBadge status={record.metrics.status} />
                </td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(record.id)}
                    title="Видалити запис"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
